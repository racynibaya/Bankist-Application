'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function (acc, sort = false) {
  // set the default hmtl of movements in html
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  // creating a row of every movement
  movs.forEach((mov, i) => {
    // type of current movement
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // creating dynamic row
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">3 days ago</div>
          <div class="movements__value">${mov}???</div>
        </div>
    `;

    // inserting latest row as first child of container
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const createUsername = function (accs) {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(n => n[0])
      .join('');
  });
};

createUsername(accounts);

const calculateDeposit = function (acc) {
  // filtering mov that > 0 (deposit) and add all of it
  return acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, cur) => acc + cur, 0);
};

const calculateWithdrew = function (acc) {
  // filtering mov that < 0 (withdraw) and add all of it
  return acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, cur) => acc + cur, 0);
};

const calculateBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);

  return acc.balance;
};

const calculateInterest = function (acc) {
  return acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int > 1)
    .reduce((acc, cur) => acc + cur, 0);
};

const updateUI = function (acc) {
  displayMovements(acc);
  labelSumIn.textContent = `${calculateDeposit(acc)}???`;
  labelSumOut.textContent = `${Math.abs(calculateWithdrew(acc))}???`;
  labelSumInterest.textContent = `${calculateInterest(acc)}???`;
  labelBalance.textContent = `${calculateBalance(acc)} ???`;
};

accounts.forEach(acc => {
  calculateBalance(acc);
});

let currentAccount;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  // Check if log user is existing
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  // Check if pin is correct
  if (currentAccount?.pin === +inputLoginPin.value) {
    updateUI(currentAccount);
    containerApp.style.opacity = 100;

    // clearing the input value
    inputLoginPin.value = '';
    inputLoginUsername.value = '';

    labelWelcome.textContent = `Welcome ${currentAccount.owner.split(' ')[0]}`;

    // Removing the focus to input
    inputLoginPin.blur();
    inputLoginUsername.blur();
  }

  inputLoginPin.value = '';
  inputLoginUsername.value = '';

  inputLoginPin.blur();
  inputLoginUsername.blur();
});

// Transfering money to another user
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +inputTransferAmount.value;

  const receiverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    currentAccount.balance >= amount &&
    receiverAccount &&
    receiverAccount.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);

    inputTransferAmount.value = '';
    inputTransferTo.value = '';
    updateUI(currentAccount);
  }
  inputTransferAmount.value = '';
  inputTransferTo.value = '';

  inputTransferAmount.blur();
  inputTransferTo.blur();
});

// Processing loan

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const loanAmount = +inputLoanAmount.value;

  const highestDeposit = currentAccount.movements.reduce(
    (acc, curr) => (acc > curr ? acc : curr),
    currentAccount.movements[0]
  );

  const isAllowedToLoan = currentAccount.movements.some(
    mov => mov >= loanAmount * 0.1
  );

  if (typeof loanAmount === 'number' && loanAmount > 0 && isAllowedToLoan) {
    currentAccount.movements.push(loanAmount);
    updateUI(currentAccount);
  }

  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

// Close Account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  // Check credentials if correct
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    // find the index of acc to close
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;

    // Change the welcome message
    labelWelcome.textContent = 'Log in to get started';
  }
});
