function truncateString(str, maxLength) {
    if (str.length > maxLength) {
        return str.slice(0, maxLength) + '...';
    }
    return str;
}

export function truncateProjectId(str) {
    return truncateString(str, 8)
}