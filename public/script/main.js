import { Account, Entry, CategoryEnum } from "./Account.js";
var account;
var initialAccount = getAccountFromStorage();
if (initialAccount) {
    account = new Account(initialAccount);
    updateBalanceAmount(account);
}
else {
    account = createInitialAccount();
    updateBalanceAmount(account);
}
function createInitialAccount() {
    var setupAccount = new Account();
    return setupAccount;
}
function getAccountFromStorage() {
    var accountFromStorage = localStorage.getItem('account');
    return accountFromStorage ? JSON.parse(accountFromStorage) : false;
}
function setAccountToStorage(account) {
    localStorage.setItem('account', JSON.stringify(account));
}
function updateBalanceAmount(account) {
    var balanceAmaountHtmlElement = document.querySelector('#balanceAmount');
    var balanceAccount = account.getBalance();
    var formattedBalance = balanceAccount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    });
    balanceAmaountHtmlElement.textContent = formattedBalance;
}
var entryTemplate = document.querySelector('#entryTemplate');
var fragment = document.createDocumentFragment();
var recordsContainer = document.querySelector('#recordsContainer');
recordsContainer.onclick = function (event) {
    if (event.target instanceof SVGElement && event.target.dataset.id) {
        var elementId = event.target.dataset.id;
        var entryElement = document.querySelector("[data-id=\"".concat(elementId, "\"]"));
        deleteElement(elementId, entryElement);
    }
};
var entries = account.getEntries();
entries.forEach(function (entry) {
    printEntry(entry);
});
function printEntry(entry) {
    var concept = entry.concept, amount = entry.amount, category = entry.category, id = entry.id;
    var entryConceptTemplate = entryTemplate.content.querySelector('.entryConcept');
    var entryAmountTemplate = entryTemplate.content.querySelector('.entryAmount');
    var entryContainerTemplate = entryTemplate.content.querySelector('div');
    var iconSvg = entryTemplate.content.querySelector('svg');
    var svgPath = entryTemplate.content.querySelector('path');
    if (!entryConceptTemplate || !entryAmountTemplate || !entryContainerTemplate || !iconSvg || !svgPath) {
        return;
    }
    entryConceptTemplate.textContent = concept;
    entryContainerTemplate.setAttribute('data-id', String(id));
    iconSvg.setAttribute('data-id', String(id));
    svgPath.setAttribute('data-id', String(id));
    var formattedAmount = amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    });
    if (category === CategoryEnum.expense) {
        entryAmountTemplate.classList.add('text-red-600');
        entryAmountTemplate.classList.remove('text-lime-500');
        entryAmountTemplate.textContent = "- ".concat(formattedAmount);
    }
    else {
        entryAmountTemplate.classList.add('text-lime-500');
        entryAmountTemplate.classList.remove('text-red-600');
        entryAmountTemplate.textContent = "".concat(formattedAmount);
    }
    var clone = entryTemplate.content.cloneNode(true);
    fragment.appendChild(clone);
    recordsContainer.appendChild(fragment);
}
function deleteElement(id, entryElement) {
    var _a, _b;
    var entryConcept = (_a = entryElement.querySelector('.entryConcept')) === null || _a === void 0 ? void 0 : _a.textContent;
    var entryAmount = (_b = entryElement.querySelector('.entryAmount')) === null || _b === void 0 ? void 0 : _b.textContent;
    Swal.fire({
        title: '¿ELIMINAR ENTRADA?',
        html: "Descripci\u00F3n: ".concat(entryConcept, "<br>Monto: ").concat(entryAmount),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#84CC16',
        cancelButtonColor: '#DC2626',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    }).then(function (result) {
        if (result.isConfirmed) {
            account.deleteEntryById(Number(id));
            setAccountToStorage(account);
            entryElement.remove();
            updateBalanceAmount(account);
            Swal.fire({
                title: 'ELIMINADA!',
                text: 'La entrada se ha eliminado',
                icon: 'success',
                confirmButtonColor: '#84CC16'
            });
        }
    });
}
var entryConceptImput = document.querySelector('#entryName');
var entryAmountImput = document.querySelector('#entryAmount');
var addIncomeButton = document.querySelector('#addIncomeButton');
var addExpenseButton = document.querySelector('#addExpenseButton');
addIncomeButton.addEventListener('click', addEntryFromTemplate.bind(this, CategoryEnum.income));
addExpenseButton.addEventListener('click', addEntryFromTemplate.bind(this, CategoryEnum.expense));
function addEntryFromTemplate(category) {
    var conceptValue = entryConceptImput.value;
    var amountValue = entryAmountImput.value;
    if (conceptValue && amountValue) {
        var entryFromValues = new Entry(conceptValue, Number(amountValue), category);
        account.addEntry(entryFromValues);
        setAccountToStorage(account);
        printEntry(entryFromValues);
        updateBalanceAmount(account);
        entryConceptImput.value = "";
        entryAmountImput.value = "";
    }
}
