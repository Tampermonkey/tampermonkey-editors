import { atob, btoa } from '../shared/environment';

export const base64_encode = (input: string): string => {
    let binary = '';
    for (let i = 0; i < input.length; i++) {
        binary += String.fromCharCode(input.charCodeAt(i) & 0xff);
    }
    return btoa(binary);
};

export const base64_decode = (input: string): string => {
    return atob(input);
};
