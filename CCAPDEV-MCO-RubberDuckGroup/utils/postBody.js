const BODY_MAX_LENGTH = 2000;
const BODY_PREVIEW_LENGTH = 320;

function normalizePostBody(value) {
    if (typeof value !== 'string')
        return '';

    return value
        .replace(/\r\n/g, '\n')
        .replace(/^\s+|\s+$/g, '')
        .replace(/\n{3,}/g, '\n\n');
}

function buildBodyPreview(body, maxLength = BODY_PREVIEW_LENGTH) {
    const normalizedBody = normalizePostBody(body);

    if (!normalizedBody)
        return {
            body: '',
            preview: '',
            isTruncated: false
        };

    if (normalizedBody.length <= maxLength) {
        return {
            body: normalizedBody,
            preview: normalizedBody,
            isTruncated: false
        };
    }

    const shortened = normalizedBody.slice(0, maxLength).trimEnd();
    const lastBreak = Math.max(shortened.lastIndexOf(' '), shortened.lastIndexOf('\n'));
    const preview = (lastBreak > maxLength * 0.6 ? shortened.slice(0, lastBreak) : shortened).trimEnd();

    return {
        body: normalizedBody,
        preview: `${preview}...`,
        isTruncated: true
    };
}

module.exports = {
    BODY_MAX_LENGTH,
    BODY_PREVIEW_LENGTH,
    normalizePostBody,
    buildBodyPreview
};