import { Account, Entry, CategoryEnum } from "./Account.js";
declare var Swal:any

let account:Account
const initialAccount = getAccountFromStorage()
if (initialAccount) {
    account = new Account(initialAccount as Account);
    updateBalanceAmount(account)
} else {
    account = createInitialAccount()
    updateBalanceAmount(account)
}

function createInitialAccount():Account {
    const setupAccount = new Account()
    return setupAccount
}

function getAccountFromStorage():Account | boolean {
    const accountFromStorage = localStorage.getItem('account')
    return accountFromStorage ? JSON.parse(accountFromStorage) : false
}

function setAccountToStorage(account:Account):void {
    localStorage.setItem('account', JSON.stringify(account))
}

function updateBalanceAmount(account:Account) {
    const balanceAmaountHtmlElement = document.querySelector('#balanceAmount') as HTMLElement
    const balanceAccount = account.getBalance()
    const formattedBalance = balanceAccount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    })
    balanceAmaountHtmlElement.textContent = formattedBalance
}

const entryTemplate = document.querySelector('#entryTemplate') as HTMLTemplateElement
const fragment = document.createDocumentFragment()
const recordsContainer = document.querySelector('#recordsContainer') as  HTMLElement

recordsContainer.onclick = function(event) {
    if(event.target instanceof SVGElement && event.target.dataset.id) {
        const elementId = event.target.dataset.id
        const entryElement = document.querySelector(`[data-id="${elementId}"]`)
        deleteElement(elementId as string, entryElement as HTMLElement)
    }
}

const entries = account.getEntries()
entries.forEach(entry => {
    printEntry(entry)
})

function printEntry(entry: Entry) {
    const { concept, amount, category, id } = entry;
    const entryConceptTemplate = entryTemplate.content.querySelector('.entryConcept');
    const entryAmountTemplate = entryTemplate.content.querySelector('.entryAmount');
    const entryContainerTemplate = entryTemplate.content.querySelector('div');
    const iconSvg = entryTemplate.content.querySelector('svg');
    const svgPath = entryTemplate.content.querySelector('path');

    if (!entryConceptTemplate || !entryAmountTemplate || !entryContainerTemplate || !iconSvg || !svgPath) {
        return;
    }

    entryConceptTemplate.textContent = concept;
    entryContainerTemplate.setAttribute('data-id', String(id));
    iconSvg.setAttribute('data-id', String(id));
    svgPath.setAttribute('data-id', String(id));

    const formattedAmount = amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    if (category === CategoryEnum.expense) {
        entryAmountTemplate.classList.add('text-red-600');
        entryAmountTemplate.classList.remove('text-lime-500');
        entryAmountTemplate.textContent = `- ${formattedAmount}`;
    } else {
        entryAmountTemplate.classList.add('text-lime-500');
        entryAmountTemplate.classList.remove('text-red-600');
        entryAmountTemplate.textContent = `${formattedAmount}`;
    }

    const clone = entryTemplate.content.cloneNode(true);
    fragment.appendChild(clone);
    recordsContainer.appendChild(fragment);
}

function deleteElement(id:string, entryElement:HTMLElement) {
    const entryConcept = entryElement.querySelector('.entryConcept')?.textContent
    const entryAmount = entryElement.querySelector('.entryAmount')?.textContent
    Swal.fire({
        title: '¿ELIMINAR ENTRADA?',
        html: `Descripción: ${entryConcept}<br>Monto: ${entryAmount}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#84CC16',
        cancelButtonColor: '#DC2626',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    }).then((result:any) => {
        if (result.isConfirmed) {
            account.deleteEntryById(Number(id))
            setAccountToStorage(account)
            entryElement.remove()
            updateBalanceAmount(account)
            Swal.fire({
                title: 'ELIMINADA!',
                text: 'La entrada se ha eliminado',
                icon: 'success',
                confirmButtonColor: '#84CC16'
            })
        }
    })
}

const entryConceptImput = document.querySelector('#entryName') as HTMLInputElement
const entryAmountImput = document.querySelector('#entryAmount') as HTMLInputElement
const addIncomeButton = document.querySelector('#addIncomeButton') as HTMLButtonElement
const addExpenseButton = document.querySelector('#addExpenseButton') as HTMLButtonElement

addIncomeButton.addEventListener('click', addEntryFromTemplate.bind(this, CategoryEnum.income))
addExpenseButton.addEventListener('click', addEntryFromTemplate.bind(this, CategoryEnum.expense))

function addEntryFromTemplate(category:CategoryEnum) {
    const conceptValue = entryConceptImput.value
    const amountValue = entryAmountImput.value
    if (conceptValue && amountValue) {
        const entryFromValues = new Entry (conceptValue, Number(amountValue), category)
        account.addEntry(entryFromValues)
        setAccountToStorage(account)
        printEntry(entryFromValues)
        updateBalanceAmount(account)
        entryConceptImput.value = ""
        entryAmountImput.value = ""
    }
}