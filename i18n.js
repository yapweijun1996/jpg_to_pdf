const TRANSLATIONS = {
    en: {
        meta: { langName: "English" },
        format: { byteUnits: ["B", "KB", "MB", "GB"] },
        app: {
            title: "JPG to PDF Converter",
            kicker: "Pure Local Workspace",
            subtitle: "Arrange JPG pages, convert them in your browser, and keep history on this device."
        },
        header: {
            languageLabel: "Language",
            helpLabel: "Open guide"
        },
        status: {
            offline: "You are offline. Local conversion and stored history still work.",
            online: "Back online."
        },
        workspace: {
            selectTitle: "Start with your images",
            selectDescription: "Drop JPG files here or browse from this device. Nothing leaves your browser.",
            chooseFiles: "Choose JPG files",
            dropHint: "Drag, drop, and reorder before you convert.",
            selectedTitle: "Arrange your PDF pages",
            selectedHint: "Drag cards on desktop or use the arrow buttons on any device.",
            actions: {
                clearSelection: "Clear selection",
                convert: "Convert to PDF"
            },
            summary: {
                files: "Selected files",
                pages: "Planned pages",
                size: "Source size"
            },
            progress: {
                idle: "Ready to generate your PDF.",
                processing: "Processing {index} of {count}: {name}",
                finalizing: "Finalizing your PDF..."
            },
            item: {
                moveUp: "Move up",
                moveDown: "Move down",
                remove: "Remove",
                drag: "Drag to reorder"
            }
        },
        result: {
            title: "Latest PDF",
            partialTitle: "Latest PDF with skipped files",
            download: "Download PDF",
            pageCount: "Pages",
            fileSize: "PDF size",
            generatedAt: "Generated",
            sourceCount: "Source files",
            skippedFiles: "Skipped files"
        },
        conversion: {
            success: "PDF ready to download.",
            partialSuccess: "PDF ready. Some files were skipped.",
            warnings: {
                skippedFiles: "Skipped {count} file(s): {files}"
            },
            errors: {
                noSelection: "Please select JPG files first.",
                noJpg: "No JPG files were found in that selection.",
                pdfLibUnavailable: "The PDF engine could not be loaded.",
                decodeAllFailed: "None of the selected files could be decoded as images.",
                decodeFailed: "One or more selected files could not be decoded as images.",
                indexedDbUnavailable: "History is unavailable in this browser session.",
                indexedDbWriteFailed: "The PDF was created, but saving it to history failed.",
                storageQuotaExceeded: "The PDF was created, but this browser's local storage limit was reached.",
                generic: "Something went wrong while generating the PDF."
            }
        },
        history: {
            title: "Conversion History",
            subtitle: "Local storage",
            clearAll: "Clear all",
            searchPlaceholder: "Search saved PDFs",
            sortLabel: "Sort",
            sorts: {
                newest: "Newest",
                oldest: "Oldest",
                largest: "Largest"
            },
            empty: "No saved PDFs yet.",
            noMatches: "No history items match that search.",
            storageTitle: "Storage usage",
            storageRetention: "Older items are trimmed automatically after 50 MB.",
            storageUsage: "{used} / {limit}",
            partialBadge: "Partial",
            completeBadge: "Complete",
            download: "Download",
            delete: "Delete",
            labels: {
                files: "Files",
                pages: "Pages",
                size: "Size",
                generated: "Generated",
                sources: "Sources",
                skipped: "Skipped"
            },
            prunedNotice: "Removed {count} older item(s) to stay within 50 MB.",
            deletedNotice: "History item deleted.",
            clearedNotice: "History cleared.",
            legacyUnavailable: "Legacy item"
        },
        pwa: {
            install: "Install app",
            offlineReady: "App shell saved for offline use.",
            installedReady: "App installed on this device.",
            updateReady: "An update is ready for this app.",
            refresh: "Refresh"
        },
        guide: {
            title: "How it works",
            close: "Close",
            closeIconLabel: "Close guide",
            steps: [
                "Choose or drop your JPG files to build a local workspace.",
                "Reorder pages by dragging cards or using the move buttons.",
                "Convert everything directly in your browser without uploading the files.",
                "Download the latest PDF and revisit older exports in local history.",
                "When installed, the app shell stays available offline on this device."
            ]
        }
    },
    zh: {
        meta: { langName: "中文" },
        format: { byteUnits: ["B", "KB", "MB", "GB"] },
        app: {
            title: "JPG 转 PDF 工具",
            kicker: "纯本地工作区",
            subtitle: "在浏览器中整理 JPG 页面、生成 PDF，并把历史记录保存在当前设备。"
        },
        header: {
            languageLabel: "语言",
            helpLabel: "打开指南"
        },
        status: {
            offline: "您已离线，但本地转换和已保存历史仍可使用。",
            online: "网络已恢复。"
        },
        workspace: {
            selectTitle: "先选择图片",
            selectDescription: "将 JPG 文件拖到这里，或从当前设备中选择。文件不会离开您的浏览器。",
            chooseFiles: "选择 JPG 文件",
            dropHint: "可先拖放、排序，再开始转换。",
            selectedTitle: "整理 PDF 页面顺序",
            selectedHint: "桌面端可拖拽排序，所有设备都可使用箭头按钮调整顺序。",
            actions: {
                clearSelection: "清空选择",
                convert: "转换为 PDF"
            },
            summary: {
                files: "已选文件",
                pages: "预计页数",
                size: "源文件大小"
            },
            progress: {
                idle: "已准备好生成 PDF。",
                processing: "正在处理第 {index} / {count} 个：{name}",
                finalizing: "正在完成 PDF..."
            },
            item: {
                moveUp: "上移",
                moveDown: "下移",
                remove: "移除",
                drag: "拖拽排序"
            }
        },
        result: {
            title: "最新生成结果",
            partialTitle: "最新生成结果（含跳过项）",
            download: "下载 PDF",
            pageCount: "页数",
            fileSize: "PDF 大小",
            generatedAt: "生成时间",
            sourceCount: "源文件数",
            skippedFiles: "已跳过文件"
        },
        conversion: {
            success: "PDF 已生成，可立即下载。",
            partialSuccess: "PDF 已生成，但有部分文件被跳过。",
            warnings: {
                skippedFiles: "已跳过 {count} 个文件：{files}"
            },
            errors: {
                noSelection: "请先选择 JPG 文件。",
                noJpg: "该选择中没有可用的 JPG 文件。",
                pdfLibUnavailable: "PDF 引擎加载失败。",
                decodeAllFailed: "所选文件都无法解码为图片。",
                decodeFailed: "其中一个或多个文件无法解码为图片。",
                indexedDbUnavailable: "当前浏览器会话无法使用历史记录。",
                indexedDbWriteFailed: "PDF 已生成，但保存到历史记录失败。",
                storageQuotaExceeded: "PDF 已生成，但浏览器本地存储空间已达到上限。",
                generic: "生成 PDF 时发生错误。"
            }
        },
        history: {
            title: "转换记录",
            subtitle: "本地存储",
            clearAll: "清除全部",
            searchPlaceholder: "搜索已保存的 PDF",
            sortLabel: "排序",
            sorts: {
                newest: "最新",
                oldest: "最早",
                largest: "最大"
            },
            empty: "还没有已保存的 PDF。",
            noMatches: "没有符合搜索条件的历史记录。",
            storageTitle: "存储占用",
            storageRetention: "超过 50 MB 后会自动清理较旧项目。",
            storageUsage: "{used} / {limit}",
            partialBadge: "部分完成",
            completeBadge: "完整",
            download: "下载",
            delete: "删除",
            labels: {
                files: "文件",
                pages: "页数",
                size: "大小",
                generated: "生成时间",
                sources: "来源",
                skipped: "已跳过"
            },
            prunedNotice: "为保持在 50 MB 以内，已移除 {count} 条较旧记录。",
            deletedNotice: "历史记录已删除。",
            clearedNotice: "历史记录已清空。",
            legacyUnavailable: "旧版记录"
        },
        pwa: {
            install: "安装应用",
            offlineReady: "应用外壳已保存，可离线打开。",
            installedReady: "应用已安装到当前设备。",
            updateReady: "应用已有可用更新。",
            refresh: "刷新"
        },
        guide: {
            title: "使用说明",
            close: "关闭",
            closeIconLabel: "关闭指南",
            steps: [
                "选择或拖入 JPG 文件，建立本地工作区。",
                "通过拖拽卡片或方向按钮调整页面顺序。",
                "直接在浏览器中完成转换，无需上传文件。",
                "下载最新 PDF，并在本地历史记录中查看旧导出。",
                "安装后，应用外壳可在当前设备上离线打开。"
            ]
        }
    },
    ja: {
        meta: { langName: "日本語" },
        format: { byteUnits: ["B", "KB", "MB", "GB"] },
        app: {
            title: "JPG → PDF 変換ツール",
            kicker: "完全ローカルの作業スペース",
            subtitle: "ブラウザ内で JPG ページを並べ替え、PDF を作成し、履歴をこの端末に保存します。"
        },
        header: {
            languageLabel: "言語",
            helpLabel: "ガイドを開く"
        },
        status: {
            offline: "オフラインです。ローカル変換と保存済み履歴は引き続き使えます。",
            online: "オンラインに戻りました。"
        },
        workspace: {
            selectTitle: "画像を選択",
            selectDescription: "JPG ファイルをここへドロップするか、この端末から選択してください。ファイルはブラウザの外へ出ません。",
            chooseFiles: "JPG ファイルを選択",
            dropHint: "変換前にドラッグ、ドロップ、並べ替えができます。",
            selectedTitle: "PDF ページ順を整える",
            selectedHint: "デスクトップではドラッグ操作、すべての端末では矢印ボタンで順序変更できます。",
            actions: {
                clearSelection: "選択をクリア",
                convert: "PDF に変換"
            },
            summary: {
                files: "選択ファイル",
                pages: "予定ページ数",
                size: "元ファイルサイズ"
            },
            progress: {
                idle: "PDF を生成する準備ができています。",
                processing: "{index} / {count} を処理中: {name}",
                finalizing: "PDF を仕上げています..."
            },
            item: {
                moveUp: "上へ移動",
                moveDown: "下へ移動",
                remove: "削除",
                drag: "ドラッグして並べ替え"
            }
        },
        result: {
            title: "最新の PDF",
            partialTitle: "最新の PDF（一部スキップあり）",
            download: "PDF をダウンロード",
            pageCount: "ページ数",
            fileSize: "PDF サイズ",
            generatedAt: "生成日時",
            sourceCount: "元ファイル数",
            skippedFiles: "スキップしたファイル"
        },
        conversion: {
            success: "PDF を生成しました。すぐにダウンロードできます。",
            partialSuccess: "PDF は生成されましたが、一部のファイルはスキップされました。",
            warnings: {
                skippedFiles: "{count} 件のファイルをスキップしました: {files}"
            },
            errors: {
                noSelection: "先に JPG ファイルを選択してください。",
                noJpg: "この選択内に利用できる JPG ファイルがありません。",
                pdfLibUnavailable: "PDF エンジンを読み込めませんでした。",
                decodeAllFailed: "選択したファイルを画像として解読できませんでした。",
                decodeFailed: "一部の選択ファイルを画像として解読できませんでした。",
                indexedDbUnavailable: "このブラウザセッションでは履歴を利用できません。",
                indexedDbWriteFailed: "PDF は作成されましたが、履歴への保存に失敗しました。",
                storageQuotaExceeded: "PDF は作成されましたが、ブラウザのローカル保存容量に達しました。",
                generic: "PDF 生成中にエラーが発生しました。"
            }
        },
        history: {
            title: "変換履歴",
            subtitle: "ローカル保存",
            clearAll: "すべて削除",
            searchPlaceholder: "保存済み PDF を検索",
            sortLabel: "並び替え",
            sorts: {
                newest: "新しい順",
                oldest: "古い順",
                largest: "サイズ順"
            },
            empty: "保存済みの PDF はまだありません。",
            noMatches: "検索条件に一致する履歴がありません。",
            storageTitle: "保存容量",
            storageRetention: "50 MB を超えると古い項目から自動整理されます。",
            storageUsage: "{used} / {limit}",
            partialBadge: "一部完了",
            completeBadge: "完了",
            download: "ダウンロード",
            delete: "削除",
            labels: {
                files: "ファイル",
                pages: "ページ",
                size: "サイズ",
                generated: "生成日時",
                sources: "元データ",
                skipped: "スキップ"
            },
            prunedNotice: "50 MB 以内に保つため、古い項目を {count} 件削除しました。",
            deletedNotice: "履歴項目を削除しました。",
            clearedNotice: "履歴をクリアしました。",
            legacyUnavailable: "旧形式の履歴"
        },
        pwa: {
            install: "アプリをインストール",
            offlineReady: "アプリシェルを保存しました。オフラインでも開けます。",
            installedReady: "この端末にアプリをインストールしました。",
            updateReady: "アプリの更新を利用できます。",
            refresh: "再読み込み"
        },
        guide: {
            title: "使い方",
            close: "閉じる",
            closeIconLabel: "ガイドを閉じる",
            steps: [
                "JPG ファイルを選択またはドロップして、ローカル作業スペースを作成します。",
                "カードのドラッグや移動ボタンでページ順を調整します。",
                "ファイルをアップロードせず、ブラウザ内でそのまま PDF を生成します。",
                "最新の PDF をダウンロードし、ローカル履歴から過去の出力を再利用できます。",
                "インストール後は、アプリシェルをこの端末でオフライン表示できます。"
            ]
        }
    },
    ms: {
        meta: { langName: "Bahasa Melayu" },
        format: { byteUnits: ["B", "KB", "MB", "GB"] },
        app: {
            title: "Penukar JPG ke PDF",
            kicker: "Ruang kerja tempatan sepenuhnya",
            subtitle: "Susun halaman JPG dalam pelayar, jana PDF, dan simpan sejarah pada peranti ini."
        },
        header: {
            languageLabel: "Bahasa",
            helpLabel: "Buka panduan"
        },
        status: {
            offline: "Anda sedang luar talian. Penukaran tempatan dan sejarah tersimpan masih boleh digunakan.",
            online: "Kembali dalam talian."
        },
        workspace: {
            selectTitle: "Mulakan dengan imej anda",
            selectDescription: "Lepaskan fail JPG di sini atau pilih daripada peranti ini. Tiada fail dihantar keluar dari pelayar anda.",
            chooseFiles: "Pilih fail JPG",
            dropHint: "Seret, lepas, dan susun semula sebelum menukar.",
            selectedTitle: "Susun halaman PDF anda",
            selectedHint: "Seret kad pada desktop atau gunakan butang anak panah pada mana-mana peranti.",
            actions: {
                clearSelection: "Kosongkan pilihan",
                convert: "Tukar ke PDF"
            },
            summary: {
                files: "Fail dipilih",
                pages: "Halaman dirancang",
                size: "Saiz sumber"
            },
            progress: {
                idle: "Sedia untuk menjana PDF anda.",
                processing: "Memproses {index} daripada {count}: {name}",
                finalizing: "Menyelesaikan PDF anda..."
            },
            item: {
                moveUp: "Naikkan",
                moveDown: "Turunkan",
                remove: "Buang",
                drag: "Seret untuk susun semula"
            }
        },
        result: {
            title: "PDF terbaru",
            partialTitle: "PDF terbaru dengan fail dilangkau",
            download: "Muat turun PDF",
            pageCount: "Halaman",
            fileSize: "Saiz PDF",
            generatedAt: "Dijana pada",
            sourceCount: "Fail sumber",
            skippedFiles: "Fail dilangkau"
        },
        conversion: {
            success: "PDF sedia untuk dimuat turun.",
            partialSuccess: "PDF sedia. Sebahagian fail telah dilangkau.",
            warnings: {
                skippedFiles: "{count} fail dilangkau: {files}"
            },
            errors: {
                noSelection: "Sila pilih fail JPG terlebih dahulu.",
                noJpg: "Tiada fail JPG yang sah ditemui dalam pilihan itu.",
                pdfLibUnavailable: "Enjin PDF tidak dapat dimuatkan.",
                decodeAllFailed: "Tiada fail dipilih yang dapat dinyahkod sebagai imej.",
                decodeFailed: "Satu atau lebih fail dipilih tidak dapat dinyahkod sebagai imej.",
                indexedDbUnavailable: "Sejarah tidak tersedia dalam sesi pelayar ini.",
                indexedDbWriteFailed: "PDF berjaya dibuat, tetapi gagal disimpan ke sejarah.",
                storageQuotaExceeded: "PDF berjaya dibuat, tetapi had storan tempatan pelayar telah dicapai.",
                generic: "Ralat berlaku semasa menjana PDF."
            }
        },
        history: {
            title: "Sejarah Penukaran",
            subtitle: "Storan tempatan",
            clearAll: "Padam semua",
            searchPlaceholder: "Cari PDF tersimpan",
            sortLabel: "Susun",
            sorts: {
                newest: "Terbaru",
                oldest: "Terlama",
                largest: "Terbesar"
            },
            empty: "Belum ada PDF tersimpan.",
            noMatches: "Tiada item sejarah yang sepadan dengan carian itu.",
            storageTitle: "Penggunaan storan",
            storageRetention: "Item lama akan dipangkas secara automatik selepas 50 MB.",
            storageUsage: "{used} / {limit}",
            partialBadge: "Sebahagian",
            completeBadge: "Lengkap",
            download: "Muat turun",
            delete: "Padam",
            labels: {
                files: "Fail",
                pages: "Halaman",
                size: "Saiz",
                generated: "Dijana",
                sources: "Sumber",
                skipped: "Dilangkau"
            },
            prunedNotice: "Mengalih keluar {count} item lama untuk kekal di bawah 50 MB.",
            deletedNotice: "Item sejarah dipadam.",
            clearedNotice: "Sejarah dipadamkan.",
            legacyUnavailable: "Item lama"
        },
        pwa: {
            install: "Pasang aplikasi",
            offlineReady: "Shell aplikasi telah disimpan untuk kegunaan luar talian.",
            installedReady: "Aplikasi telah dipasang pada peranti ini.",
            updateReady: "Kemas kini aplikasi tersedia.",
            refresh: "Muat semula"
        },
        guide: {
            title: "Cara ia berfungsi",
            close: "Tutup",
            closeIconLabel: "Tutup panduan",
            steps: [
                "Pilih atau lepaskan fail JPG untuk membina ruang kerja tempatan.",
                "Susun semula halaman dengan menyeret kad atau menggunakan butang gerak.",
                "Jana PDF terus dalam pelayar tanpa memuat naik fail.",
                "Muat turun PDF terkini dan akses semula eksport lama dalam sejarah tempatan.",
                "Selepas dipasang, shell aplikasi boleh dibuka luar talian pada peranti ini."
            ]
        }
    }
};

const DEFAULT_LANG = "en";
const LANGUAGE_LOCALES = {
    en: "en-US",
    zh: "zh-CN",
    ja: "ja-JP",
    ms: "ms-MY"
};

let _lang = DEFAULT_LANG;

if (typeof localStorage !== "undefined") {
    const savedLang = localStorage.getItem("lang");
    if (savedLang && TRANSLATIONS[savedLang]) {
        _lang = savedLang;
    }
}

function resolvePath(obj, path) {
    return path.split(".").reduce((value, key) => (
        value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined
    ), obj);
}

function getLocale() {
    return LANGUAGE_LOCALES[_lang] || LANGUAGE_LOCALES[DEFAULT_LANG];
}

function getLang() {
    return _lang;
}

function setLang(code) {
    _lang = TRANSLATIONS[code] ? code : DEFAULT_LANG;
    if (typeof localStorage !== "undefined") {
        localStorage.setItem("lang", _lang);
    }
}

function t(path, vars = {}) {
    const dict = TRANSLATIONS[_lang] || TRANSLATIONS[DEFAULT_LANG];
    const fallback = TRANSLATIONS[DEFAULT_LANG];
    let value = resolvePath(dict, path);
    if (value === undefined) value = resolvePath(fallback, path);
    if (typeof value !== "string") return path;

    return Object.entries(vars).reduce((output, [key, replacement]) => (
        output.replaceAll(`{${key}}`, replacement)
    ), value);
}

function tArr(path) {
    const dict = TRANSLATIONS[_lang] || TRANSLATIONS[DEFAULT_LANG];
    const fallback = TRANSLATIONS[DEFAULT_LANG];
    const value = resolvePath(dict, path);
    if (Array.isArray(value)) return value;
    const fallbackValue = resolvePath(fallback, path);
    return Array.isArray(fallbackValue) ? fallbackValue : [];
}

function getLanguageName(code) {
    return TRANSLATIONS[code]?.meta?.langName || code;
}

function getSupportedLangs() {
    return Object.keys(TRANSLATIONS);
}

function formatDateTime(value) {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(getLocale(), {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

function formatNumber(value, options = {}) {
    return new Intl.NumberFormat(getLocale(), options).format(value);
}

function formatBytes(bytes) {
    const safeBytes = Number.isFinite(bytes) && bytes > 0 ? bytes : 0;
    const units = tArr("format.byteUnits");
    const fallbackUnits = ["B", "KB", "MB", "GB"];
    const labels = units.length ? units : fallbackUnits;

    if (safeBytes === 0) {
        return `0 ${labels[0]}`;
    }

    const exponent = Math.min(
        Math.floor(Math.log(safeBytes) / Math.log(1024)),
        labels.length - 1
    );
    const value = safeBytes / (1024 ** exponent);
    const digits = value >= 100 || exponent === 0 ? 0 : 1;
    return `${formatNumber(value, { maximumFractionDigits: digits })} ${labels[exponent]}`;
}

function formatList(items) {
    if (!Array.isArray(items) || items.length === 0) return "";
    if (typeof Intl.ListFormat === "function") {
        return new Intl.ListFormat(getLocale(), {
            style: "short",
            type: "conjunction"
        }).format(items);
    }
    return items.join(", ");
}
