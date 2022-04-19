const closePopup = (popup) => {
    popup.style.display = "none";
}

const openPopup = (popup) => {
    popup.style.display = "block";
}

const resetSession = () => {
    localStorage.clear();
}
export { closePopup, openPopup, resetSession}; 
