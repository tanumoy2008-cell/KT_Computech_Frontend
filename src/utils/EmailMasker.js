const EmailMasker = email => {
    const [text, domain] = email.split("@");
    
    const firstPart = text.slice(0,2);
    const endPart = text.slice(-2);
    const midLength = text.length - firstPart.length - endPart.length;
    const masked = "⁕".repeat(Math.max(0, midLength));
    return `${firstPart}${masked}${endPart}@${domain}`;
}
export default EmailMasker;