export function isNewsImageUrl(value:string):boolean {
 return /^https?:\/\//i.test(value) || /^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(value) || (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\'));
}
