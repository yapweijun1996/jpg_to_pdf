(function () {
    const DB_NAME = "jpgToPdfDB";
    const DB_VERSION = 2;
    const STORE_NAME = "conversions";
    const HISTORY_FILENAME_PREFIX = "jpg-to-pdf";
    const MAX_HISTORY_BYTES = 50 * 1024 * 1024;
    const ONLINE_BANNER_DURATION_MS = 2400;
    const ACCEPTED_FILE_PATTERN = /\.(jpe?g)$/i;

    const state = {
        selectedItems: [],
        result: null,
        db: null,
        historyEntries: [],
        historyQuery: "",
        historySort: "newest",
        deferredPrompt: null,
        swRegistration: null,
        swRefreshPending: false,
        networkTimerId: null,
        previewUrls: new Set(),
        historyUrls: new Set(),
        dragItemId: null,
        isConverting: false,
        inlineAlert: null,
        appNotice: null,
        historyNotice: null
    };

    const el = {};

    document.addEventListener("DOMContentLoaded", init);

    async function init() {
        cacheElements();
        initLanguageSelect();
        bindEvents();
        applyTranslations();
        applyInstalledState();
        updateConnectivityBanner();
        await initializeHistory();
        registerServiceWorker();
    }

    function cacheElements() {
        [
            "appEyebrow", "titleText", "appSubtitle", "langLabelText", "langSelect",
            "guideBtn", "installBtn", "networkBanner", "appBanner", "appBannerText",
            "appBannerAction", "workspaceKicker", "dropTitle", "dropDescription",
            "workspaceMain", "dropZone", "dropHint", "chooseFilesBtn", "fileInput", "selectionSummaryStrip",
            "selectedFilesLabel", "selectedFilesValue", "selectedPagesLabel", "selectedPagesValue",
            "selectedSizeLabel", "selectedSizeValue", "selectedWorkspace", "selectedTitle",
            "selectedHint", "clearSelectionBtn", "convertButton", "progressWrap",
            "progressFill", "progressLabel", "conversionStatus", "selectedList",
            "resultSection", "resultKicker", "resultTitle", "resultBody", "resultDownload",
            "resultMeta", "resultSkippedWrap", "resultSkippedLabel", "resultSkippedList",
            "inlineAlert", "historyKicker", "historyTitle", "clearHistoryBtn", "storageLabel",
            "storageSummary", "storageNote", "storageFill", "historySearchInput",
            "historySortLabel", "historySortSelect", "historyNotice", "historyList",
            "historyEmpty", "modalOverlay", "modalTitle", "modalSteps", "modalClose",
            "modalCloseIcon"
        ].forEach(id => {
            el[id] = document.getElementById(id);
        });
    }

    function initLanguageSelect() {
        const fragment = document.createDocumentFragment();
        getSupportedLangs().forEach(code => {
            const option = document.createElement("option");
            option.value = code;
            option.textContent = getLanguageName(code);
            fragment.appendChild(option);
        });
        el.langSelect.replaceChildren(fragment);
        el.langSelect.value = getLang();
    }

    function bindEvents() {
        el.langSelect.addEventListener("change", () => {
            setLang(el.langSelect.value);
            applyTranslations();
            renderSelectionWorkspace();
            renderResult();
            renderHistory();
            updateConnectivityBanner();
        });

        el.guideBtn.addEventListener("click", openGuide);
        el.modalClose.addEventListener("click", closeGuide);
        el.modalCloseIcon.addEventListener("click", closeGuide);
        el.modalOverlay.addEventListener("click", event => {
            if (event.target === el.modalOverlay) closeGuide();
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeGuide();
        });

        el.chooseFilesBtn.addEventListener("click", () => el.fileInput.click());
        el.dropZone.addEventListener("click", event => {
            if (event.target === el.chooseFilesBtn) return;
            el.fileInput.click();
        });
        el.dropZone.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                el.fileInput.click();
            }
        });

        el.fileInput.addEventListener("change", () => {
            handleFiles(Array.from(el.fileInput.files || []));
            el.fileInput.value = "";
        });

        el.dropZone.addEventListener("dragover", event => {
            event.preventDefault();
            el.dropZone.classList.add("dragover");
        });
        el.dropZone.addEventListener("dragleave", () => {
            el.dropZone.classList.remove("dragover");
        });
        el.dropZone.addEventListener("drop", event => {
            event.preventDefault();
            el.dropZone.classList.remove("dragover");
            handleFiles(Array.from(event.dataTransfer?.files || []));
        });

        el.clearSelectionBtn.addEventListener("click", () => clearSelection(true));
        el.convertButton.addEventListener("click", convertSelectedFiles);

        el.selectedList.addEventListener("click", handleSelectedListAction);
        el.selectedList.addEventListener("dragstart", handleSelectionDragStart);
        el.selectedList.addEventListener("dragover", handleSelectionDragOver);
        el.selectedList.addEventListener("drop", handleSelectionDrop);
        el.selectedList.addEventListener("dragend", handleSelectionDragEnd);

        el.historySearchInput.addEventListener("input", () => {
            state.historyQuery = el.historySearchInput.value.trim().toLowerCase();
            renderHistory();
        });
        el.historySortSelect.addEventListener("change", () => {
            state.historySort = el.historySortSelect.value;
            renderHistory();
        });

        el.clearHistoryBtn.addEventListener("click", async () => {
            if (!state.db) {
                setInlineAlert("warning", "conversion.errors.indexedDbUnavailable");
                return;
            }
            await clearHistoryEntries();
            state.historyEntries = [];
            setHistoryNotice("info", "history.clearedNotice");
            renderHistory();
        });

        el.historyList.addEventListener("click", handleHistoryAction);

        el.installBtn.addEventListener("click", promptInstall);
        el.appBannerAction.addEventListener("click", () => {
            if (typeof state.appNotice?.action === "function") {
                state.appNotice.action();
            }
        });

        window.addEventListener("beforeinstallprompt", event => {
            event.preventDefault();
            state.deferredPrompt = event;
            el.installBtn.hidden = false;
            el.installBtn.textContent = t("pwa.install");
        });

        window.addEventListener("appinstalled", () => {
            state.deferredPrompt = null;
            el.installBtn.hidden = true;
            showAppBanner("success", "pwa.installedReady");
        });

        window.addEventListener("online", () => updateConnectivityBanner(true));
        window.addEventListener("offline", () => updateConnectivityBanner());
        window.addEventListener("beforeunload", revokeActiveUrls);
    }

    function applyTranslations() {
        document.documentElement.lang = getLang();
        document.title = t("app.title");
        el.appEyebrow.textContent = t("app.kicker");
        el.titleText.textContent = t("app.title");
        el.appSubtitle.textContent = t("app.subtitle");
        el.langLabelText.textContent = t("header.languageLabel");
        el.guideBtn.title = t("header.helpLabel");
        el.guideBtn.setAttribute("aria-label", t("header.helpLabel"));
        el.installBtn.title = t("pwa.install");

        el.workspaceKicker.textContent = t("app.kicker");
        el.dropTitle.textContent = t("workspace.selectTitle");
        el.dropDescription.textContent = t("workspace.selectDescription");
        el.dropHint.textContent = t("workspace.dropHint");
        el.chooseFilesBtn.textContent = t("workspace.chooseFiles");
        el.dropZone.setAttribute("aria-label", t("workspace.selectTitle"));

        el.selectedFilesLabel.textContent = t("workspace.summary.files");
        el.selectedPagesLabel.textContent = t("workspace.summary.pages");
        el.selectedSizeLabel.textContent = t("workspace.summary.size");
        el.selectedTitle.textContent = t("workspace.selectedTitle");
        el.selectedHint.textContent = t("workspace.selectedHint");
        el.clearSelectionBtn.textContent = t("workspace.actions.clearSelection");
        el.convertButton.textContent = t("workspace.actions.convert");
        if (!state.isConverting) {
            el.conversionStatus.textContent = t("workspace.progress.idle");
        }

        el.resultSkippedLabel.textContent = t("result.skippedFiles");

        el.historyKicker.textContent = t("history.subtitle");
        el.historyTitle.textContent = t("history.title");
        el.clearHistoryBtn.textContent = t("history.clearAll");
        el.storageLabel.textContent = t("history.storageTitle");
        el.historySearchInput.placeholder = t("history.searchPlaceholder");
        el.historySearchInput.setAttribute("aria-label", t("history.searchPlaceholder"));
        el.historySortLabel.textContent = t("history.sortLabel");
        applyHistorySortOptions();
        el.storageNote.textContent = t("history.storageRetention");

        el.modalTitle.textContent = t("guide.title");
        el.modalClose.textContent = t("guide.close");
        el.modalCloseIcon.setAttribute("aria-label", t("guide.closeIconLabel"));
        renderGuideSteps();

        if (state.deferredPrompt) {
            el.installBtn.textContent = t("pwa.install");
        }

        renderInlineAlert();
        renderAppBanner();
        renderHistoryNotice();
        renderWorkspaceState();
    }

    function applyHistorySortOptions() {
        const options = [
            ["newest", t("history.sorts.newest")],
            ["oldest", t("history.sorts.oldest")],
            ["largest", t("history.sorts.largest")]
        ];
        const fragment = document.createDocumentFragment();
        options.forEach(([value, label]) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;
            fragment.appendChild(option);
        });
        el.historySortSelect.replaceChildren(fragment);
        el.historySortSelect.value = state.historySort;
    }

    function renderGuideSteps() {
        const steps = tArr("guide.steps");
        el.modalSteps.replaceChildren();
        steps.forEach(step => {
            const item = document.createElement("li");
            item.textContent = step;
            el.modalSteps.appendChild(item);
        });
    }

    function openGuide() {
        el.modalOverlay.classList.remove("is-hidden");
    }

    function closeGuide() {
        el.modalOverlay.classList.add("is-hidden");
    }

    function updateConnectivityBanner(showOnlinePulse = false) {
        clearTimeout(state.networkTimerId);

        if (!navigator.onLine) {
            showBanner(el.networkBanner, "offline", t("status.offline"));
            return;
        }

        if (showOnlinePulse) {
            showBanner(el.networkBanner, "online", t("status.online"));
            state.networkTimerId = window.setTimeout(() => {
                hideBanner(el.networkBanner);
            }, ONLINE_BANNER_DURATION_MS);
            return;
        }

        hideBanner(el.networkBanner);
    }

    function showBanner(node, tone, text) {
        node.textContent = text;
        node.className = `status-banner ${tone}`;
        node.classList.remove("is-hidden");
    }

    function hideBanner(node) {
        node.className = "status-banner is-hidden";
        node.textContent = "";
    }

    function showAppBanner(tone, path, vars = {}, actionLabelPath = "", action = null) {
        state.appNotice = { tone, path, vars, actionLabelPath, action };
        renderAppBanner();
    }

    function renderAppBanner() {
        if (!state.appNotice) {
            el.appBanner.className = "status-banner is-hidden";
            el.appBannerText.textContent = "";
            el.appBannerAction.hidden = true;
            el.appBannerAction.textContent = "";
            return;
        }

        el.appBanner.className = `status-banner ${state.appNotice.tone}`;
        el.appBanner.classList.remove("is-hidden");
        el.appBannerText.textContent = t(state.appNotice.path, state.appNotice.vars || {});

        if (state.appNotice.action && state.appNotice.actionLabelPath) {
            el.appBannerAction.hidden = false;
            el.appBannerAction.textContent = t(state.appNotice.actionLabelPath);
        } else {
            el.appBannerAction.hidden = true;
            el.appBannerAction.textContent = "";
        }
    }

    function handleFiles(files) {
        const acceptedFiles = files.filter(file => ACCEPTED_FILE_PATTERN.test(file.name));
        if (acceptedFiles.length === 0) {
            setInlineAlert("error", "conversion.errors.noJpg");
            return;
        }

        replaceSelection(acceptedFiles);
        setInlineAlert(null);
    }

    function replaceSelection(files) {
        clearSelection(false);
        const sortedFiles = [...files].sort((a, b) => compareNumericFileNames(a.name, b.name));
        state.selectedItems = sortedFiles.map((file, index) => createSelectionItem(file, index));
        renderSelectionWorkspace();
    }

    function compareNumericFileNames(nameA, nameB) {
        const numberA = parseInt(nameA.match(/(\d+)/)?.[0] ?? "0", 10);
        const numberB = parseInt(nameB.match(/(\d+)/)?.[0] ?? "0", 10);
        if (numberA !== numberB) return numberA - numberB;
        return nameA.localeCompare(nameB);
    }

    function createSelectionItem(file, index) {
        const previewUrl = URL.createObjectURL(file);
        state.previewUrls.add(previewUrl);
        return {
            id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
            file,
            name: file.name,
            size: file.size,
            previewUrl
        };
    }

    function clearSelection(shouldRender) {
        state.previewUrls.forEach(url => URL.revokeObjectURL(url));
        state.previewUrls.clear();
        state.selectedItems = [];
        state.dragItemId = null;
        resetProgress();
        if (shouldRender) {
            renderSelectionWorkspace();
        }
    }

    function renderSelectionWorkspace() {
        const hasSelection = state.selectedItems.length > 0;
        el.selectionSummaryStrip.classList.toggle("is-hidden", !hasSelection);
        el.selectedWorkspace.classList.toggle("is-hidden", !hasSelection);
        el.selectedFilesValue.textContent = formatNumber(state.selectedItems.length);
        el.selectedPagesValue.textContent = formatNumber(state.selectedItems.length);
        el.selectedSizeValue.textContent = formatBytes(sumBy(state.selectedItems, item => item.size));

        if (!hasSelection) {
            el.selectedList.replaceChildren();
            el.conversionStatus.textContent = t("workspace.progress.idle");
            syncActionStates();
            renderWorkspaceState();
            return;
        }

        if (!state.isConverting) {
            el.conversionStatus.textContent = t("workspace.progress.idle");
        }

        const fragment = document.createDocumentFragment();
        state.selectedItems.forEach((item, index) => {
            fragment.appendChild(createSelectedItemElement(item, index));
        });
        el.selectedList.replaceChildren(fragment);
        syncActionStates();
        renderWorkspaceState();
    }

    function createSelectedItemElement(item, index) {
        const entry = document.createElement("li");
        entry.className = "selected-item";
        entry.dataset.itemId = item.id;
        entry.draggable = true;

        const img = document.createElement("img");
        img.className = "selected-thumb";
        img.src = item.previewUrl;
        img.alt = item.name;

        const meta = document.createElement("div");
        meta.className = "selected-meta";

        const name = document.createElement("span");
        name.className = "selected-name";
        name.textContent = item.name;
        name.title = item.name;

        const subline = document.createElement("span");
        subline.className = "selected-subline";
        subline.textContent = `${formatNumber(index + 1)} • ${formatBytes(item.size)}`;

        meta.append(name, subline);

        const actions = document.createElement("div");
        actions.className = "selected-actions";
        actions.append(
            createMiniButton("↑", "move-up", item.id, t("workspace.item.moveUp"), index === 0),
            createMiniButton("↓", "move-down", item.id, t("workspace.item.moveDown"), index === state.selectedItems.length - 1),
            createMiniButton("✕", "remove", item.id, t("workspace.item.remove"), false)
        );

        entry.append(img, meta, actions);
        return entry;
    }

    function createMiniButton(label, action, itemId, title, disabled) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mini-button";
        button.dataset.action = action;
        button.dataset.itemId = itemId;
        button.textContent = label;
        button.title = title;
        button.disabled = disabled || state.isConverting;
        return button;
    }

    function syncActionStates() {
        const disabled = state.isConverting;
        el.convertButton.disabled = disabled || state.selectedItems.length === 0;
        el.clearSelectionBtn.disabled = disabled || state.selectedItems.length === 0;
        el.chooseFilesBtn.disabled = disabled;
        el.langSelect.disabled = disabled;
        el.guideBtn.disabled = disabled;
        renderWorkspaceState();
    }

    function handleSelectedListAction(event) {
        const button = event.target.closest("button[data-action]");
        if (!button || state.isConverting) return;
        const itemId = button.dataset.itemId;
        if (button.dataset.action === "remove") {
            removeSelectedItem(itemId);
        }
        if (button.dataset.action === "move-up") {
            moveSelectedItem(itemId, -1);
        }
        if (button.dataset.action === "move-down") {
            moveSelectedItem(itemId, 1);
        }
    }

    function removeSelectedItem(itemId) {
        const removed = state.selectedItems.find(item => item.id === itemId);
        state.selectedItems = state.selectedItems.filter(item => item.id !== itemId);
        if (removed?.previewUrl) {
            URL.revokeObjectURL(removed.previewUrl);
            state.previewUrls.delete(removed.previewUrl);
        }
        renderSelectionWorkspace();
    }

    function moveSelectedItem(itemId, delta) {
        const fromIndex = state.selectedItems.findIndex(item => item.id === itemId);
        const toIndex = fromIndex + delta;
        if (fromIndex < 0 || toIndex < 0 || toIndex >= state.selectedItems.length) return;
        const reordered = [...state.selectedItems];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);
        state.selectedItems = reordered;
        renderSelectionWorkspace();
    }

    function handleSelectionDragStart(event) {
        const item = event.target.closest(".selected-item");
        if (!item || state.isConverting) return;
        state.dragItemId = item.dataset.itemId;
        item.classList.add("dragging");
    }

    function handleSelectionDragOver(event) {
        const item = event.target.closest(".selected-item");
        if (!item || !state.dragItemId) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }

    function handleSelectionDrop(event) {
        const item = event.target.closest(".selected-item");
        if (!item || !state.dragItemId) return;
        event.preventDefault();
        reorderSelectedItems(state.dragItemId, item.dataset.itemId);
    }

    function handleSelectionDragEnd() {
        state.dragItemId = null;
        el.selectedList.querySelectorAll(".selected-item.dragging").forEach(node => {
            node.classList.remove("dragging");
        });
    }

    function reorderSelectedItems(fromId, toId) {
        if (fromId === toId) {
            handleSelectionDragEnd();
            return;
        }
        const reordered = [...state.selectedItems];
        const fromIndex = reordered.findIndex(item => item.id === fromId);
        const toIndex = reordered.findIndex(item => item.id === toId);
        if (fromIndex < 0 || toIndex < 0) return;
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);
        state.selectedItems = reordered;
        handleSelectionDragEnd();
        renderSelectionWorkspace();
    }

    async function convertSelectedFiles() {
        if (state.selectedItems.length === 0) {
            setInlineAlert("error", "conversion.errors.noSelection");
            return;
        }

        resetResult();
        clearHistoryNotice();
        setInlineAlert(null);
        state.isConverting = true;
        syncActionStates();
        showProgress(0, state.selectedItems.length, t("workspace.progress.idle"));

        try {
            const outcome = await createPdfFromSelection();
            showResult(outcome);

            if (state.db) {
                try {
                    const prunedCount = await saveHistoryEntry(outcome);
                    await refreshHistory();
                    if (prunedCount > 0) {
                        setHistoryNotice("info", "history.prunedNotice", {
                            count: formatNumber(prunedCount)
                        });
                    }
                } catch (error) {
                    console.error("History save failed:", error);
                    setInlineAlert("warning", getHistoryWriteErrorPath(error));
                }
            } else {
                setInlineAlert("warning", "conversion.errors.indexedDbUnavailable");
            }
        } catch (error) {
            console.error("PDF conversion failed:", error);
            const descriptor = getConversionErrorDescriptor(error);
            setInlineAlert("error", descriptor.path, descriptor.vars);
        } finally {
            state.isConverting = false;
            resetProgress();
            renderSelectionWorkspace();
        }
    }

    async function createPdfFromSelection() {
        if (!window.PDFLib?.PDFDocument) {
            throw createAppError("pdfLibUnavailable");
        }

        const pdfDoc = await PDFLib.PDFDocument.create();
        const failedSourceNames = [];
        const total = state.selectedItems.length;

        for (let index = 0; index < total; index += 1) {
            const item = state.selectedItems[index];
            showProgress(index + 1, total, t("workspace.progress.processing", {
                index: formatNumber(index + 1),
                count: formatNumber(total),
                name: item.name
            }));

            try {
                const image = await embedImageFromFile(pdfDoc, item.file);
                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height
                });
            } catch (_error) {
                failedSourceNames.push(item.name);
            }
        }

        const pageCount = total - failedSourceNames.length;
        if (pageCount === 0) {
            throw createAppError("decodeAllFailed", {
                names: failedSourceNames
            });
        }

        showProgress(total, total, t("workspace.progress.finalizing"));
        const pdfBytes = await pdfDoc.save();
        const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
        const timestamp = Date.now();

        return {
            fileName: `${HISTORY_FILENAME_PREFIX}-${timestamp}.pdf`,
            timestamp,
            fileCount: total,
            pageCount,
            pdfBlob,
            pdfSize: pdfBlob.size,
            sourceNames: state.selectedItems.map(item => item.name),
            failedSourceNames,
            status: failedSourceNames.length > 0 ? "partial" : "complete"
        };
    }

    async function embedImageFromFile(pdfDoc, file) {
        const imageBytes = await file.arrayBuffer();

        try {
            return await pdfDoc.embedJpg(imageBytes);
        } catch (_jpegError) {
            try {
                const pngBytes = await rasterizeImageToPng(file);
                return await pdfDoc.embedPng(pngBytes);
            } catch (_decodeError) {
                throw createAppError("decodeFailed", { fileName: file.name });
            }
        }
    }

    async function rasterizeImageToPng(file) {
        const objectUrl = URL.createObjectURL(file);
        try {
            const image = await loadImage(objectUrl);
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth || image.width;
            canvas.height = image.naturalHeight || image.height;
            const context = canvas.getContext("2d");
            if (!context) {
                throw createAppError("decodeFailed", { fileName: file.name });
            }
            context.drawImage(image, 0, 0);
            const pngBlob = await new Promise((resolve, reject) => {
                canvas.toBlob(blob => {
                    if (blob) resolve(blob);
                    else reject(createAppError("decodeFailed", { fileName: file.name }));
                }, "image/png");
            });
            return pngBlob.arrayBuffer();
        } finally {
            URL.revokeObjectURL(objectUrl);
        }
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(createAppError("decodeFailed"));
            img.src = src;
        });
    }

    function showProgress(current, total, label) {
        el.progressWrap.classList.remove("is-hidden");
        const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
        el.progressFill.style.width = `${percentage}%`;
        el.progressLabel.textContent = label;
        el.conversionStatus.textContent = label;
    }

    function resetProgress() {
        el.progressWrap.classList.add("is-hidden");
        el.progressFill.style.width = "0%";
        el.progressLabel.textContent = "";
    }

    function showResult(result) {
        revokeResultUrl();
        state.result = {
            ...result,
            downloadUrl: URL.createObjectURL(result.pdfBlob)
        };
        renderResult();

        if (result.status === "partial") {
            setInlineAlert("warning", "conversion.warnings.skippedFiles", {
                count: formatNumber(result.failedSourceNames.length),
                files: summarizeNames(result.failedSourceNames)
            });
        } else {
            setInlineAlert(null);
        }
    }

    function renderResult() {
        if (!state.result) {
            el.resultSection.classList.add("is-hidden");
            el.resultMeta.replaceChildren();
            el.resultSkippedWrap.classList.add("is-hidden");
            renderWorkspaceState();
            return;
        }

        const isPartial = state.result.status === "partial";
        el.resultSection.classList.remove("is-hidden");
        el.resultKicker.textContent = isPartial ? t("conversion.partialSuccess") : t("conversion.success");
        el.resultTitle.textContent = isPartial ? t("result.partialTitle") : t("result.title");
        el.resultBody.textContent = state.result.fileName;
        el.resultDownload.textContent = t("result.download");
        el.resultDownload.href = state.result.downloadUrl;
        el.resultDownload.download = state.result.fileName;

        const metaItems = [
            [t("result.pageCount"), formatNumber(state.result.pageCount)],
            [t("result.fileSize"), formatBytes(state.result.pdfSize)],
            [t("result.generatedAt"), formatDateTime(state.result.timestamp)],
            [t("result.sourceCount"), formatNumber(state.result.fileCount)]
        ];

        el.resultMeta.replaceChildren(
            ...metaItems.map(([label, value]) => createMetaCard(label, value))
        );

        if (state.result.failedSourceNames.length > 0) {
            el.resultSkippedWrap.classList.remove("is-hidden");
            el.resultSkippedList.textContent = state.result.failedSourceNames.join(", ");
        } else {
            el.resultSkippedWrap.classList.add("is-hidden");
            el.resultSkippedList.textContent = "";
        }

        renderWorkspaceState();
    }

    function createMetaCard(label, value) {
        const card = document.createElement("article");
        card.className = "result-meta-card";
        const labelEl = document.createElement("span");
        labelEl.textContent = label;
        const valueEl = document.createElement("strong");
        valueEl.textContent = value;
        card.append(labelEl, valueEl);
        return card;
    }

    function setInlineAlert(tone, path, vars = {}) {
        if (!tone || !path) {
            state.inlineAlert = null;
        } else {
            state.inlineAlert = { tone, path, vars };
        }
        renderInlineAlert();
    }

    function renderInlineAlert() {
        if (!state.inlineAlert) {
            el.inlineAlert.className = "inline-alert is-hidden";
            el.inlineAlert.textContent = "";
            renderWorkspaceState();
            return;
        }
        el.inlineAlert.className = `inline-alert ${state.inlineAlert.tone}`;
        el.inlineAlert.textContent = t(state.inlineAlert.path, state.inlineAlert.vars || {});
        renderWorkspaceState();
    }

    function getConversionErrorDescriptor(error) {
        if (!error || !error.code) return { path: "conversion.errors.generic" };
        if (error.code === "decodeAllFailed") return { path: "conversion.errors.decodeAllFailed" };
        if (error.code === "pdfLibUnavailable") return { path: "conversion.errors.pdfLibUnavailable" };
        if (error.code === "decodeFailed") return { path: "conversion.errors.decodeFailed" };
        return { path: "conversion.errors.generic" };
    }

    function createAppError(code, details = {}) {
        const error = new Error(code);
        error.code = code;
        error.details = details;
        return error;
    }

    function getHistoryWriteErrorPath(error) {
        return isQuotaExceededError(error)
            ? "conversion.errors.storageQuotaExceeded"
            : "conversion.errors.indexedDbWriteFailed";
    }

    function isQuotaExceededError(error) {
        return Boolean(error && (
            error.name === "QuotaExceededError"
            || error.code === 22
            || error.code === 1014
        ));
    }

    async function initializeHistory() {
        try {
            state.db = await openDB();
            await refreshHistory();
        } catch (error) {
            console.error("IndexedDB unavailable:", error);
            state.db = null;
            state.historyEntries = [];
            setHistoryNotice("warning", "conversion.errors.indexedDbUnavailable");
            renderHistory();
        }
    }

    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = event => {
                const db = event.target.result;
                let store;

                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
                } else {
                    store = event.target.transaction.objectStore(STORE_NAME);
                }

                if (!store.indexNames.contains("timestamp")) {
                    store.createIndex("timestamp", "timestamp");
                }
            };

            request.onsuccess = event => resolve(event.target.result);
            request.onerror = event => reject(event.target.error);
        });
    }

    async function refreshHistory() {
        if (!state.db) {
            renderHistory();
            return;
        }
        state.historyEntries = (await loadAllHistoryEntries()).map(normalizeHistoryEntry);
        renderHistory();
    }

    function loadAllHistoryEntries() {
        return new Promise((resolve, reject) => {
            const tx = state.db.transaction(STORE_NAME, "readonly");
            const request = tx.objectStore(STORE_NAME).index("timestamp").getAll();
            request.onsuccess = event => resolve(event.target.result || []);
            request.onerror = event => reject(event.target.error);
        });
    }

    function normalizeHistoryEntry(entry) {
        const failedSourceNames = Array.isArray(entry.failedSourceNames) ? entry.failedSourceNames : [];
        const sourceNames = Array.isArray(entry.sourceNames) ? entry.sourceNames : [];
        const fileName = entry.fileName || entry.pdfUrl?.split("/").pop() || `${HISTORY_FILENAME_PREFIX}-${entry.timestamp || Date.now()}.pdf`;
        const fileCount = entry.fileCount || sourceNames.length || entry.pageCount || 0;
        const pageCount = entry.pageCount || fileCount || 0;
        const pdfSize = entry.pdfSize || entry.pdfBlob?.size || 0;
        const status = entry.status || (failedSourceNames.length > 0 ? "partial" : "complete");

        return {
            ...entry,
            fileName,
            fileCount,
            pageCount,
            pdfSize,
            sourceNames,
            failedSourceNames,
            status
        };
    }

    async function saveHistoryEntry(entry) {
        await new Promise((resolve, reject) => {
            const tx = state.db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).add(entry);
            tx.oncomplete = resolve;
            tx.onerror = event => reject(event.target.error);
        });

        return pruneHistoryEntries();
    }

    async function pruneHistoryEntries() {
        const entries = (await loadAllHistoryEntries()).map(normalizeHistoryEntry);
        let totalBytes = sumBy(entries, entry => entry.pdfSize);
        if (totalBytes <= MAX_HISTORY_BYTES) return 0;

        const idsToDelete = [];
        while (entries.length > 1 && totalBytes > MAX_HISTORY_BYTES) {
            const oldest = entries.shift();
            idsToDelete.push(oldest.id);
            totalBytes -= oldest.pdfSize;
        }

        if (idsToDelete.length === 0) return 0;

        await new Promise((resolve, reject) => {
            const tx = state.db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            idsToDelete.forEach(id => store.delete(id));
            tx.oncomplete = resolve;
            tx.onerror = event => reject(event.target.error);
        });

        return idsToDelete.length;
    }

    async function clearHistoryEntries() {
        await new Promise((resolve, reject) => {
            const tx = state.db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).clear();
            tx.oncomplete = resolve;
            tx.onerror = event => reject(event.target.error);
        });
    }

    async function deleteHistoryEntry(entryId) {
        await new Promise((resolve, reject) => {
            const tx = state.db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).delete(entryId);
            tx.oncomplete = resolve;
            tx.onerror = event => reject(event.target.error);
        });
    }

    function renderHistory() {
        revokeHistoryUrls();
        const allEntries = [...state.historyEntries];
        const totalBytes = sumBy(allEntries, entry => entry.pdfSize);
        const percent = Math.min(100, MAX_HISTORY_BYTES === 0 ? 0 : (totalBytes / MAX_HISTORY_BYTES) * 100);
        el.storageSummary.textContent = t("history.storageUsage", {
            used: formatBytes(totalBytes),
            limit: formatBytes(MAX_HISTORY_BYTES)
        });
        el.storageFill.style.width = `${percent}%`;
        el.storageNote.textContent = t("history.storageRetention");

        const filteredEntries = allEntries.filter(entry => (
            entry.fileName.toLowerCase().includes(state.historyQuery)
        ));
        const visibleEntries = sortHistoryEntries(filteredEntries);

        el.historyList.replaceChildren();
        if (visibleEntries.length === 0) {
            el.historyEmpty.textContent = allEntries.length === 0
                ? t("history.empty")
                : t("history.noMatches");
            return;
        }

        el.historyEmpty.textContent = "";
        const fragment = document.createDocumentFragment();
        visibleEntries.forEach(entry => {
            fragment.appendChild(createHistoryItem(entry));
        });
        el.historyList.appendChild(fragment);
    }

    function sortHistoryEntries(entries) {
        const sorted = [...entries];
        if (state.historySort === "largest") {
            sorted.sort((a, b) => b.pdfSize - a.pdfSize || b.timestamp - a.timestamp);
        } else if (state.historySort === "oldest") {
            sorted.sort((a, b) => a.timestamp - b.timestamp);
        } else {
            sorted.sort((a, b) => b.timestamp - a.timestamp);
        }
        return sorted;
    }

    function createHistoryItem(entry) {
        const item = document.createElement("li");
        item.className = "history-item";
        item.dataset.entryId = entry.id;

        const topRow = document.createElement("div");
        topRow.className = "history-row";

        const titleBlock = document.createElement("div");
        const title = document.createElement("p");
        title.className = "history-name";
        title.textContent = entry.fileName;

        const badges = document.createElement("div");
        badges.className = "history-badges";
        badges.appendChild(createBadge(
            entry.status === "partial" ? "partial" : "complete",
            entry.status === "partial" ? t("history.partialBadge") : t("history.completeBadge")
        ));
        if (!entry.pdfBlob && (!entry.pdfUrl || entry.pdfUrl.startsWith("blob:"))) {
            badges.appendChild(createBadge("legacy", t("history.legacyUnavailable")));
        }
        titleBlock.append(title, badges);
        topRow.appendChild(titleBlock);

        const meta = document.createElement("div");
        meta.className = "history-meta";
        meta.append(
            createHistoryMetaChip(t("history.labels.generated"), formatDateTime(entry.timestamp)),
            createHistoryMetaChip(t("history.labels.size"), formatBytes(entry.pdfSize)),
            createHistoryMetaChip(t("history.labels.pages"), formatNumber(entry.pageCount)),
            createHistoryMetaChip(t("history.labels.files"), formatNumber(entry.fileCount))
        );

        const sourceText = document.createElement("p");
        sourceText.className = "history-source-list";
        sourceText.textContent = `${t("history.labels.sources")}: ${summarizeNames(entry.sourceNames)}`;

        const skippedText = document.createElement("p");
        skippedText.className = "history-source-list";
        if (entry.failedSourceNames.length > 0) {
            skippedText.textContent = `${t("history.labels.skipped")}: ${summarizeNames(entry.failedSourceNames)}`;
        } else {
            skippedText.hidden = true;
        }

        const actions = document.createElement("div");
        actions.className = "history-actions";

        const downloadInfo = getHistoryDownloadInfo(entry);
        if (downloadInfo) {
            const download = document.createElement("a");
            download.className = "action-link primary";
            download.href = downloadInfo.href;
            download.download = downloadInfo.download;
            download.textContent = t("history.download");
            actions.appendChild(download);
        } else {
            const disabled = document.createElement("button");
            disabled.type = "button";
            disabled.className = "action-link disabled";
            disabled.textContent = t("history.legacyUnavailable");
            disabled.disabled = true;
            actions.appendChild(disabled);
        }

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "action-link";
        deleteButton.dataset.historyAction = "delete";
        deleteButton.dataset.entryId = entry.id;
        deleteButton.textContent = t("history.delete");
        actions.appendChild(deleteButton);

        item.append(topRow, meta, sourceText, skippedText, actions);
        return item;
    }

    function createBadge(kind, text) {
        const badge = document.createElement("span");
        badge.className = `badge ${kind}`;
        badge.textContent = text;
        return badge;
    }

    function createHistoryMetaChip(label, value) {
        const chip = document.createElement("div");
        chip.className = "history-meta-chip";
        const labelEl = document.createElement("span");
        labelEl.textContent = label;
        const valueEl = document.createElement("strong");
        valueEl.textContent = value;
        chip.append(labelEl, valueEl);
        return chip;
    }

    function getHistoryDownloadInfo(entry) {
        if (entry.pdfBlob) {
            const href = URL.createObjectURL(entry.pdfBlob);
            state.historyUrls.add(href);
            return { href, download: entry.fileName };
        }

        if (entry.pdfUrl && !entry.pdfUrl.startsWith("blob:")) {
            return { href: entry.pdfUrl, download: entry.fileName };
        }

        return null;
    }

    async function handleHistoryAction(event) {
        const button = event.target.closest("button[data-history-action]");
        if (!button || !state.db) return;
        if (button.dataset.historyAction !== "delete") return;

        await deleteHistoryEntry(Number(button.dataset.entryId));
        await refreshHistory();
        setHistoryNotice("info", "history.deletedNotice");
    }

    function setHistoryNotice(tone, path, vars = {}) {
        state.historyNotice = { tone, path, vars };
        renderHistoryNotice();
    }

    function renderHistoryNotice() {
        if (!state.historyNotice) {
            el.historyNotice.className = "history-notice is-hidden";
            el.historyNotice.textContent = "";
            return;
        }
        el.historyNotice.className = `history-notice ${state.historyNotice.tone}`;
        el.historyNotice.classList.remove("is-hidden");
        el.historyNotice.textContent = t(state.historyNotice.path, state.historyNotice.vars || {});
    }

    function clearHistoryNotice() {
        state.historyNotice = null;
        renderHistoryNotice();
    }

    async function promptInstall() {
        if (!state.deferredPrompt) return;
        state.deferredPrompt.prompt();
        const choice = await state.deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
            el.installBtn.hidden = true;
        }
        state.deferredPrompt = null;
    }

    function applyInstalledState() {
        const isStandalone = Boolean(
            (typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches)
            || window.navigator.standalone
        );

        if (!isStandalone) return;

        state.deferredPrompt = null;
        el.installBtn.hidden = true;
        if (!state.appNotice) {
            showAppBanner("success", "pwa.installedReady");
        }
    }

    function registerServiceWorker() {
        if (!("serviceWorker" in navigator) || !window.location.protocol.startsWith("http")) {
            return;
        }

        navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (state.swRefreshPending) {
                window.location.reload();
            }
        });

        window.addEventListener("load", async () => {
            try {
                const registration = await navigator.serviceWorker.register("./service-worker.js", {
                    updateViaCache: "none"
                });
                state.swRegistration = registration;
                monitorServiceWorkerRegistration(registration);
                scheduleServiceWorkerUpdateChecks(registration);
                if (registration.waiting) {
                    activateWaitingServiceWorker(registration);
                } else {
                    registration.update().catch(error => {
                        console.warn("Service worker update check failed:", error);
                    });
                }
            } catch (error) {
                console.error("Service worker registration failed:", error);
            }
        });
    }

    function monitorServiceWorkerRegistration(registration) {
        registration.addEventListener("updatefound", () => {
            const worker = registration.installing;
            if (!worker) return;
            worker.addEventListener("statechange", () => {
                if (worker.state !== "installed") return;
                if (navigator.serviceWorker.controller) {
                    activateWaitingServiceWorker(registration);
                } else {
                    showAppBanner("success", "pwa.offlineReady");
                }
            });
        });
    }

    function handleServiceWorkerMessage(event) {
        if (event.data?.type === "SW_ACTIVE") {
            if (!state.swRefreshPending) {
                showAppBanner("success", "pwa.offlineReady");
            }
        }
    }

    function showUpdateBanner() {
        showAppBanner("info", "pwa.updateReady", {}, "pwa.refresh", () => {
            if (state.swRegistration?.waiting) {
                state.swRefreshPending = true;
                state.swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
            } else {
                window.location.reload();
            }
        });
    }

    function activateWaitingServiceWorker(registration = state.swRegistration) {
        if (!registration?.waiting) return;
        state.swRefreshPending = true;
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }

    function scheduleServiceWorkerUpdateChecks(registration) {
        const requestUpdate = () => {
            registration.update().catch(error => {
                console.warn("Service worker update check failed:", error);
            });
        };

        window.setTimeout(requestUpdate, 1200);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                requestUpdate();
            }
        });
        window.addEventListener("focus", requestUpdate);
    }

    function summarizeNames(names) {
        if (!names || names.length === 0) return "—";
        if (names.length <= 3) return formatList(names);
        const visible = names.slice(0, 3);
        return `${formatList(visible)} +${formatNumber(names.length - 3)}`;
    }

    function renderWorkspaceState() {
        let nextState = "idle";

        if (state.isConverting) {
            nextState = "converting";
        } else if (state.inlineAlert?.tone === "error") {
            nextState = "error";
        } else if (state.result?.status === "partial") {
            nextState = "partial";
        } else if (state.result?.status === "complete") {
            nextState = "success";
        } else if (state.selectedItems.length > 0) {
            nextState = "selected";
        }

        el.workspaceMain.dataset.state = nextState;
    }

    function revokeActiveUrls() {
        revokeResultUrl();
        revokeHistoryUrls();
        state.previewUrls.forEach(url => URL.revokeObjectURL(url));
        state.previewUrls.clear();
    }

    function revokeResultUrl() {
        if (state.result?.downloadUrl) {
            URL.revokeObjectURL(state.result.downloadUrl);
        }
        state.result = null;
    }

    function revokeHistoryUrls() {
        state.historyUrls.forEach(url => URL.revokeObjectURL(url));
        state.historyUrls.clear();
    }

    function resetResult() {
        revokeResultUrl();
        renderResult();
    }

    function sumBy(items, getter) {
        return items.reduce((total, item) => total + getter(item), 0);
    }
})();
