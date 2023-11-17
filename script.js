"use strict";

///////////////////////////////////////////////
///////////////////////////////////////////////
// BANKIST APP

// Data
// DIFFERENT DATA! Contains movement dates, currency and locale
const account1 = {
    owner: "Jonas Schmedtmann",
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,
    movementsDates: ["2019-11-18T21:31:17.178Z", "2019-12-23T07:42:02.383Z", "2020-01-28T09:15:04.904Z", "2020-04-01T10:17:24.185Z", "2020-05-08T14:11:59.604Z", "2020-05-27T17:01:17.194Z", "2020-07-11T23:36:17.929Z", "2020-07-12T10:51:36.790Z"],
    currency: "EUR",
    locale: "pt-Pt", // de-DE
};

const account2 = {
    owner: "Mohamed Mahmoud",
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
    movementsDates: ["2019-11-01T13:15:33.035Z", "2019-11-30T09:48:16.867Z", "2019-12-25T06:04:23.907Z", "2020-01-25T14:18:46.235Z", "2020-02-05T16:33:06.386Z", "2020-04-10T14:43:26.374Z", "2020-06-25T18:49:59.371Z", "2020-07-26T12:01:20.894Z"],
    currency: "USD",
    locale: "en-US",
};

const accounts = [account1, account2];

const updateAccounts = function () {
    accounts.forEach((acc) => {
        acc.usrName = acc.owner
            .toLowerCase()
            .split(" ")
            .map((ele) => ele[0])
            .join("");
    });
};
updateAccounts();
// Elements
// Labels
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

// containers
const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

//Buttons
const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

//input
const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
//App
//Global variables
let currentAccount, timer;
//Functions
const formatNumber = (value, curr, locale) => new Intl.NumberFormat(locale, { style: "currency", currency: curr }).format(value);
const setTimer = () => {
    let time = 300;
    const tick = function () {
        const minute = String(Math.trunc(time / 60)).padStart(2, 0);
        const second = String(time % 60).padStart(2, 0);
        labelTimer.textContent = `${minute}:${second}`;
        if (time === 0) {
            clearInterval(interval);
            labelWelcome.textContent = `Log in to get started`;
            containerApp.style.opacity = 0;
        }
        time--;
    };
    tick();
    const interval = setInterval(tick, 1000);
    return interval;
};
const displayDate = (date, locale) => {
    const calcDays = (dateOne, dateTwo) => Math.abs(Math.round((dateOne - dateTwo) / (1000 * 60 * 60 * 24)));
    const numberOfDays = calcDays(new Date(), date);
    if (numberOfDays === 0) return "Today";
    if (numberOfDays === 1) return "Yesterday";
    if (numberOfDays <= 7) return `${numberOfDays} Days ago`;
/*         const year = date.getFullYear(),
        month = `${date.getMonth()}`.padStart(2, 0),
        day = `${date.getDate()}`.padStart(2, 0);
    return `${day}/${month}/${year}`;  */
    return new Intl.DateTimeFormat(locale).format(date);
};
const displayMovments = function (acc, sort = false) {
    containerMovements.innerHTML = "";
    const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;
    movs.forEach((element, i) => {
        const movDate = new Date(acc.movementsDates[i]);
        const disDate = displayDate(movDate, acc.locale);
        const ele = `<div class="movements__row">
    <div class="movements__type movements__type--${element > 0 ? "deposit" : "withdrawal"}">
    ${i + 1} ${element > 0 ? "deposit" : "withdrawal"}
    </div>
    <div class="movements__date">${disDate}</div>
    <div class="movements__value">${formatNumber(element, acc.currency, acc.locale)}</div>
    </div>`;
        containerMovements.insertAdjacentHTML("afterbegin", ele);
    });
};
const displayCurrentBalance = function (acc) {
    acc.balance = acc.movements.reduce((acc, ele) => acc + ele);
    labelBalance.textContent = `${formatNumber(acc.balance, acc.currency, acc.locale)}`;
};
const calcSummaryAndDisplay = function (acc) {
    const incomes = acc.movements.filter((mov) => mov > 0).reduce((acc, ele) => acc + ele, 0);
    const outcomes = acc.movements.filter((mov) => mov < 0).reduce((acc, ele) => acc + ele, 0);
    const interest = acc.movements
        .filter((mov) => mov > 0)
        .map((ele) => ele * acc.interestRate)
        .filter((ele) => ele >= 1)
        .reduce((acc, i) => acc + i);
    labelSumIn.textContent = `${formatNumber(incomes, acc.currency, acc.locale)}`;
    labelSumOut.textContent = `${formatNumber(Math.abs(outcomes), acc.currency, acc.locale)}`;
    labelSumInterest.textContent = `${formatNumber(interest, acc.currency, acc.locale)}`;
};
const showUI = function (acc) {
    displayCurrentBalance(acc);
    displayMovments(acc);
    calcSummaryAndDisplay(acc);
};
/////////////////////////////////////////////////
//Start with Login , Events
btnLogin.addEventListener("click", (e) => {
    e.preventDefault();
    currentAccount = accounts.find((ele) => inputLoginUsername.value === ele.usrName);
    if (Number(inputLoginPin.value) === currentAccount?.pin) {
        labelWelcome.textContent = `Welcome Back , ${currentAccount.owner.split(" ")[0]}`;
        containerApp.style.opacity = 1;
        showUI(currentAccount);
        const currentDate = new Date();
        /*         const year = currentDate.getFullYear(),
            month = `${currentDate.getMonth()}`.padStart(2, 0),
            day = `${currentDate.getDate()}`.padStart(2, 0);
        const hours = `${currentDate.getHours()}`.padStart(2, 0),
            mintues = `${currentDate.getMinutes()}`.padStart(2, 0);
        labelDate.textContent = `${day}/${month}/${year}  ${hours}:${mintues}`; */
        const formatDate = {
            hour: "numeric",
            minute: "numeric",
            day: "numeric",
            month: "numeric",
            year: "numeric",
        };
        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, formatDate).format();
        // Set And Reset Timer
        if (timer) clearInterval(timer);
        timer = setTimer();
    }
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();
    inputLoginUsername.blur();
});
// Transfar Money
btnTransfer.addEventListener("click", function (e) {
    e.preventDefault();
    const reciveAcc = accounts.find((acc) => acc.usrName === inputTransferTo.value);
    const movment = Number(inputTransferAmount.value);
    if (movment > 0 && reciveAcc && reciveAcc?.owner !== currentAccount.owner && currentAccount.balance >= movment) {
        reciveAcc.movements.push(movment);
        reciveAcc.movementsDates.push(new Date().toISOString());
        currentAccount.movements.push(-movment);
        currentAccount.movementsDates.push(new Date().toISOString());
        showUI(currentAccount);
    }
    inputTransferTo.value = inputTransferAmount.value = "";
    inputTransferTo.blur();
    inputTransferAmount.blur();
    // Set And Reset Timer
    if (timer) clearInterval(timer);
    timer = setTimer();
});
// close Account
btnClose.addEventListener("click", function (e) {
    e.preventDefault();
    if (currentAccount.usrName === inputCloseUsername.value && currentAccount.pin === Number(inputClosePin.value)) {
        const findAcc = accounts.findIndex((acc) => acc.usrName === currentAccount.usrName);
        accounts.splice(findAcc, 1);
        containerApp.style.opacity = 0;
        labelWelcome.textContent = `Log in to get started`;
    }
    inputCloseUsername.value = inputClosePin.value = "";
    inputClosePin.blur();
    inputCloseUsername.blur();
});
// Request loan
btnLoan.addEventListener("click", function (e) {
    e.preventDefault();
    const amount = Number(inputLoanAmount.value);
    if (amount > 0 && currentAccount.movements.some((el) => amount * 0.1 <= el)) {
        setTimeout(() => {
            currentAccount.movements.push(amount);
            currentAccount.movementsDates.push(new Date().toISOString());
            showUI(currentAccount);
        }, 2500);
    }
    inputLoanAmount.value = "";
    inputLoanAmount.blur();
    // Set And Reset Timer
    if (timer) clearInterval(timer);
    timer = setTimer();
});
// Sort
let sorted = false;
btnSort.addEventListener("click", function (e) {
    e.preventDefault();
    displayMovments(currentAccount, !sorted);
    sorted = !sorted;
});
