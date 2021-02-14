console.log("manosiuntos contents script working");

const WEIGHT = 500; // should come from options
const OBSERVER_DEFAULTS = { subtree: true, childList: true };

let appRootRef;
let currentRefName;
let recipient;

// hacks to properly trigger angular input change
const setNgInput = (inputRef, value, select = false) => {
  inputRef.value = value;
  inputRef.dispatchEvent(new Event("focus", { bubbles: true }));
  inputRef.dispatchEvent(new Event("input", { bubbles: true }));
  inputRef.dispatchEvent(new Event("change", { bubbles: true }));
  inputRef.dispatchEvent(new Event("blur", { bubbles: true }));
};

const getCountry = (countryString) => {
  switch (countryString) {
    case "United States":
      return "Jungtinės Amerikos Valstijos";
    case "Ireland":
      return "Airija";
    default:
      return "Jungtinės Amerikos Valstijos";
  }
};

const stepOneHandler = (sendItemStepOneRef) => {
  currentRefName = sendItemStepOneRef.localName;

  const fromPostLabelRef = sendItemStepOneRef.querySelector("label[for='from-tab-3']");
  const toAddressLabelRef = sendItemStepOneRef.querySelector("label[for='to-tab-1']");

  fromPostLabelRef.click();
  toAddressLabelRef.click();

  const sizeObserver = new MutationObserver(() => {
    const mSizeLabelRef = sendItemStepOneRef.querySelector("label[for='box-s1-sc2-3']");

    if (!mSizeLabelRef) return;

    mSizeLabelRef.click();
    sizeObserver.destroy();

    const weightObserver = new MutationObserver(() => {
      const weightInputRef = sendItemStepOneRef.querySelector(".parcel-additional-options input");

      if (!weightInputRef) return;

      setNgInput(weightInputRef, (recipient.quantity * WEIGHT) / 1000);
      weightObserver.destroy();
    });

    weightObserver.observe(sendItemStepOneRef, OBSERVER_DEFAULTS);
  });

  sizeObserver.observe(sendItemStepOneRef, OBSERVER_DEFAULTS);
};

const stepTwoHandler = (sendItemStepTwoRef) => {
  currentRefName = sendItemStepTwoRef.localName;

  const country = getCountry(recipient.country);
  const enterKeyboardEvent = new KeyboardEvent("keydown", {
    code: "Enter",
    key: "Enter",
    charKode: 13,
    keyCode: 13,
    view: window,
    bubbles: true,
  });

  const recipientInputRef = sendItemStepTwoRef.querySelector("input[formcontrolname='recipient']");
  setNgInput(recipientInputRef, recipient.name);

  // TODO: update to simpler selector
  const countryInputRef = sendItemStepTwoRef.querySelector("input[placeholder='Šalis']");

  setTimeout(() => {
    countryInputRef.focus();
    countryInputRef.value = country;
    countryInputRef.dispatchEvent(new Event("input", { bubbles: true }));

    setTimeout(() => {
      // wait for countries to refresh and hit enter
      countryInputRef.dispatchEvent(enterKeyboardEvent);

      const cityInputRef = sendItemStepTwoRef.querySelector("input.localityCtrl");
      setNgInput(cityInputRef, recipient.city);

      const firstLineInputRef = sendItemStepTwoRef.querySelector("input[formcontrolname='address1']");
      setNgInput(firstLineInputRef, recipient.firstLine);

      const secondLineInputRef = sendItemStepTwoRef.querySelector("input[formcontrolname='address2']");
      // TODO: parse and add state here:
      setNgInput(secondLineInputRef, recipient.secondLine);

      const zipInputRef = sendItemStepTwoRef.querySelector("input[formcontrolname='postalCode']");
      setNgInput(zipInputRef, recipient.zip);

      const emailInputRef = sendItemStepTwoRef.querySelector("input[formcontrolname='email']");
      if (recipient.email.length) {
        setNgInput(emailInputRef, recipient.email);
      }
    }, 600);
  }, 200);
};

const stepThreeHandler = (sendItemStepThreeRef) => {
  currentRefName = sendItemStepThreeRef.localName;

  const observer = new MutationObserver((mutationsList, observer) => {
    const thirdPlanRefs = sendItemStepThreeRef.querySelectorAll("app-service-plan");
    if (thirdPlanRefs.length === 0) return;

    thirdPlanRefs[2].querySelector("button.service-select-button").click();
    setTimeout(() => {
      sendItemStepThreeRef.querySelector(".new-parcel-actions a[role='button']").click();
    }, 0);
  });

  observer.observe(sendItemStepThreeRef, OBSERVER_DEFAULTS);
};

const onLoad = () => {
  appRootRef = document.querySelector("app-root");
  chrome.storage.sync.get("recipient", (result) => {
    recipient = result.recipient;
  });
  const observer = new MutationObserver((mutationsList, observer) => {
    const dashboardHomeRef = document.querySelector("dashboard-home");
    const sendItemStepOneRef = document.querySelector("send-item-step-one");
    const sendItemStepTwoRef = document.querySelector("send-item-step-two");
    const sendItemStepThreeRef = document.querySelector("send-item-step-three");
    const appPrepare = document.querySelector("app-prepare"); // final step/list

    if (dashboardHomeRef && currentRefName !== dashboardHomeRef.localName) {
      currentRefName = dashboardHomeRef.localName;
      console.log("enter dashboard");
    }

    if (sendItemStepOneRef && currentRefName !== sendItemStepOneRef.localName) {
      stepOneHandler(sendItemStepOneRef);
    }

    if (sendItemStepTwoRef && currentRefName !== sendItemStepTwoRef.localName) {
      stepTwoHandler(sendItemStepTwoRef);
    }

    if (sendItemStepThreeRef && currentRefName !== sendItemStepThreeRef.localName) {
      stepThreeHandler(sendItemStepThreeRef);
    }
  });
  observer.observe(appRootRef, OBSERVER_DEFAULTS);
};

window.addEventListener("load", onLoad);
