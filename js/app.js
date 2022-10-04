(() => {
    "use strict";
    let addWindowScrollEvent = false;
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    const sliderCtns = document.querySelectorAll(".form-calculation-item__block-input");
    sliderCtns.forEach((sliderCtn => {
        const slider = sliderCtn.querySelector(".form-calculation-item__range");
        const input = sliderCtn.querySelector(".form-calculation-item__input");
        const inputRepresentation = sliderCtn.querySelector(".form-calculation-item__input-representation");
        const progress = sliderCtn.querySelector(".form-calculation-item__range-progress");
        const maxValue = slider.getAttribute("max");
        function setInputValuesBySlider() {
            input.value = slider.value;
            if ("range-car-cost" === slider.id) inputRepresentation.innerHTML = parseInt(input.value).toLocaleString("ru");
            setSliderProgressBar(slider, progress, maxValue);
        }
        function setSliderValuesByInput() {
            const minValue = slider.getAttribute("min");
            slider.value = input.value;
            if (input.value > Number(maxValue)) {
                progress.style.width = 100 + "%";
                slider.value = maxValue;
                input.value = maxValue;
            } else if (input.value <= Number(minValue)) {
                progress.style.width = 0 + "%";
                slider.value = minValue;
                input.value = minValue;
                calcDownPayment();
            } else setSliderProgressBar(slider, progress, maxValue);
            if ("input-car-cost" === input.id) inputRepresentation.innerHTML = parseInt(input.value).toLocaleString("ru");
        }
        function checkMaxNumberChars() {
            if (input.value.length >= input.dataset.size) {
                console.log(input.dataset.size);
                input.value = input.value.slice(0, input.dataset.size);
            }
        }
        slider.addEventListener("input", setInputValuesBySlider);
        slider.addEventListener("input", (() => {
            if ("range-car-cost" === slider.id) calcDownPayment();
            calcMonthlyPayment();
        }));
        input.addEventListener("input", checkMaxNumberChars);
        input.addEventListener("change", setSliderValuesByInput);
        input.addEventListener("change", (() => {
            if ("input-car-cost" === input.id && input.value > Number(input.min)) calcDownPayment();
            calcMonthlyPayment();
        }));
    }));
    function setSliderProgressBar(slider, progress, maxValue) {
        if ("range-car-cost" === slider.id) progress.style.width = (slider.value - 1e6) / (maxValue - 1e6) * 100 + "%";
        if ("range-down-payment" === slider.id) {
            progress.style.width = (slider.value - 10) / (maxValue - 10) * 100 + "%";
            calcDownPayment();
        }
        if ("range-leasing-term" === slider.id) progress.style.width = (slider.value - 1) / (maxValue - 1) * 100 + "%";
    }
    const inputs = document.querySelectorAll(".form-calculation__input-list input");
    inputs.forEach((input => {
        if ("number" === input.type) {
            input.onfocus = () => {
                input.style.backgroundColor = "#ffffff";
                input.closest(".form-calculation-item__block-input").style.backgroundColor = "#ffffff";
                if ("input-down-payment" === input.id) input.parentElement.style.backgroundColor = "#ffffff";
            };
            input.onblur = () => {
                input.nextElementSibling.style.display = "block";
                input.nextElementSibling.focus();
                if ("input-down-payment" === input.id) {
                    input.style.backgroundColor = "#EBEBEC";
                    input.parentElement.style.backgroundColor = "#EBEBEC";
                } else input.style.backgroundColor = "#F3F3F4";
                input.closest(".form-calculation-item__block-input").style.backgroundColor = "#F3F3F4";
            };
        }
    }));
    const inputRepresentations = document.querySelectorAll(".form-calculation-item__input-representation");
    inputRepresentations.forEach((inputRepresentation => {
        inputRepresentation.addEventListener("click", (() => {
            if (!inputRepresentation.closest("._disabled")) {
                inputRepresentation.style.display = "none";
                inputRepresentation.previousElementSibling.focus();
            }
        }));
    }));
    function calcDownPayment() {
        const downPaymentPercentage = document.querySelector("#input-down-payment").value;
        const outputRubValue = document.querySelector(".down-payment");
        const carCost = document.querySelector("#input-car-cost").value;
        outputRubValue.innerHTML = Math.ceil(carCost / 100 * downPaymentPercentage).toLocaleString("ru");
    }
    function calcMonthlyPayment() {
        const carCost = document.querySelector("#input-car-cost").value;
        const downPayment = Number(document.querySelector(".down-payment").innerHTML.replace(/&nbsp;+/g, ""));
        const leasingTerm = document.querySelector("#input-leasing-term").value;
        const interestRate = .035;
        const monthPay = document.querySelector(".monthly-payment");
        monthPay.innerHTML = Math.ceil((carCost - downPayment) * (interestRate * Math.pow(1 + interestRate, leasingTerm) / (Math.pow(1 + interestRate, leasingTerm) - 1))).toLocaleString();
        calcContractAmount(downPayment, leasingTerm, monthPay.innerHTML);
    }
    function calcContractAmount(downPayment, leasingTerm, monthPay) {
        const contractAmount = document.querySelector(".contract-amount");
        contractAmount.innerHTML = Math.ceil(downPayment + leasingTerm * Number(monthPay.replace(/&nbsp;+/g, ""))).toLocaleString();
    }
    document.forms[0].addEventListener("submit", (e => {
        e.preventDefault();
        sendForm();
    }));
    const delay = ms => new Promise((resolve => {
        setTimeout((() => resolve()), ms);
    }));
    async function sendForm() {
        const form = document.forms[0];
        const submitBtn = form.querySelector('[type="submit"]');
        const formElems = form.querySelectorAll("input");
        const inputBlocks = form.querySelectorAll(".form-calculation-item__block-input");
        try {
            submitBtn.disabled = true;
            submitBtn.children[0].classList.remove("_hide");
            submitBtn.children[1].classList.add("_hide");
            formElems.forEach((elem => {
                elem.disabled = true;
            }));
            inputBlocks.forEach((block => {
                block.classList.add("_disabled");
            }));
            await delay(2e3);
            const url = "https://echo.htmlacademy.ru/";
            const data = {
                car_coast: Number(form.querySelector("#input-car-cost").value),
                initail_payment: Number(form.querySelector(".down-payment").innerHTML.replace(/\s+/g, "")),
                initail_payment_percent: Number(form.querySelector("#input-down-payment").value),
                lease_term: Number(form.querySelector("#input-leasing-term").value),
                total_sum: Number(form.querySelector(".contract-amount").innerHTML.replace(/\s+/g, "")),
                monthly_payment_from: Number(form.querySelector(".monthly-payment").innerHTML.replace(/\s+/g, ""))
            };
            let response = await fetch(url, {
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            unlockForm(formElems, inputBlocks, submitBtn);
            if (response.success) {
                let result = await response.json();
                console.log(result);
            }
        } catch (error) {
            console.log(error);
            unlockForm(formElems, inputBlocks, submitBtn);
        }
    }
    function unlockForm(formElems, inputBlocks, submitBtn) {
        formElems.forEach((elem => {
            elem.disabled = false;
        }));
        inputBlocks.forEach((block => {
            block.classList.remove("_disabled");
        }));
        submitBtn.children[0].classList.add("_hide");
        submitBtn.children[1].classList.remove("_hide");
        submitBtn.disabled = false;
    }
    window["FLS"] = true;
})();