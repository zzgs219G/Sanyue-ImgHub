/**
 * URL 构建工具函数
 * 用于生成各种格式的文件链接（原始链接、Markdown、HTML、BBCode）
 */

/**
 * 根据 srcID 和文件名生成所有格式的 URL
 *
 * 注意：srcID 传入完整 http(s) 直链时（如 CNB 渠道），rootUrl 会被直接拼在前面，
 * 得到 `https://前缀/https://cnb.cool/...` 的错误链接。
 * 调用方（UploadForm.vue handleSuccess）对直链渠道应自行构建各格式 URL，不要调用本函数。
 *
 * @param {string} srcID - 文件资源 ID；自托管渠道为文件 ID，直链渠道不应使用本函数
 * @param {string} name - 文件名
 * @param {string} rootUrl - 链接前缀（本站域名或自定义前缀）
 * @returns {{ finalURL: string, mdURL: string, htmlURL: string, ubbURL: string }}
 */
export function buildFileUrls(srcID, name, rootUrl) {
    const url = rootUrl + srcID
    return {
        finalURL: url,
        mdURL: `![${name}](${url})`,
        htmlURL: `<img src="${url}" alt="${name}" width=100% />`,
        ubbURL: `[img]${url}[/img]`
    }
}

/**
 * 根据 selectedUrlForm 获取对应格式的 URL 值
 * @param {object} file - 文件对象，包含 finalURL/mdURL/htmlURL/ubbURL
 * @param {string} format - 格式类型：'url'（原始链接）| 'md'（Markdown）| 'html'（HTML）| 'ubb'（BBCode）
 * @returns {string} 对应格式的 URL；格式未知时回退返回原始链接 finalURL
 */
export function getUrlByFormat(file, format) {
    const map = {
        url: file.finalURL,
        md: file.mdURL,
        html: file.htmlURL,
        ubb: file.ubbURL
    }
    return map[format] || file.finalURL
}

/**
 * 批量更新文件列表中的 URL（当自定义链接前缀变化时）
 * @param {Array} fileList - 文件对象列表，每项含 srcID / name / uploadChannel
 * @param {string} rootUrl - 新的链接前缀
 */
export function updateFileListUrls(fileList, rootUrl) {
    fileList.forEach(item => {
        // 外链渠道：URL 由用户手动填写，不做任何拼接
        if (item.uploadChannel === 'external') {
            return
        }
        // 直链渠道（如 CNB）：srcID 为空且 finalURL 本身就是完整 http(s) 直链，
        // 不依赖本站域名和链接前缀，跳过重建，避免直链被二次拼接破坏
        if (!item.srcID && /^https?:\/\//.test(item.finalURL || '')) {
            return
        }
        const urls = buildFileUrls(item.srcID, item.name, rootUrl)
        Object.assign(item, urls)
    })
}
