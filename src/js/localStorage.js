function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
};

function loadFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
};

function removeLocalStorage(key) {
    localStorage.removeItem(key);
};

function clearLocalStorage() {
    localStorage.clear();
};

export { saveToLocalStorage, loadFromLocalStorage, removeLocalStorage, clearLocalStorage };