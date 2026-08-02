// Morde Gram Vikas Mandal Mumbai
// Dashboard Script

function getTransactions() {
    return JSON.parse(localStorage.getItem("transactions")) || [];
}

function saveTransactions(data) {
    localStorage.setItem("transactions", JSON.stringify(data));
}

function calculateBalance() {

    const data = getTransactions();

    let income = 0;
    let expense = 0;

    data.forEach(item => {

        if (item.type === "income") {
            income += Number(item.amount);
        }

        if (item.type === "expense") {
            expense += Number(item.amount);
        }

    });

    const balance = income - expense;

    const balanceElement = document.getElementById("balance");

    if (balanceElement) {
        balanceElement.innerHTML = "₹ " + balance.toLocaleString("en-IN");
    }

}

window.onload = function () {
    calculateBalance();
};
