import styles from "./index.css";
import * as api from "@api";

(function () {
  const STATE = "APP_STATE";
  const INITIAL_STATE = {
    funnels: [],
  };

  const loadState = () => {
    try {
      const serializedState = localStorage.getItem(STATE);
      if (serializedState === null) {
        return INITIAL_STATE;
      }
      return JSON.parse(serializedState);
    } catch (err) {
      return INITIAL_STATE;
    }
  };

  const saveState = (value = INITIAL_STATE) => {
    try {
      const serializedState = JSON.stringify(value);
      localStorage.setItem(STATE, serializedState);
    } catch (err) {
      console.log(err);
    }
  };

  const FORM_INPUTS = ["INPUT", "SELECT", "TEXTAREA"];

  const getState = () => {
    const pstate = loadState();
    return pstate;
  };

  let PERSISTED_STATE = getState();

  const state = {
    selectedElm: "",
    isSubmitting: false,
  };
  const app = () => {
    useState(() => {
      state.selectedElm = "";
    });

    document.addEventListener("click", pageClickListener);

    renderDom();
  };

  const clearPreviousSelection = () => {
    const hjTarget = document.getElementsByClassName("hj__selector");
    const hjSelect = document.getElementsByClassName("hj__select");

    if (hjTarget.length > 0) {
      hjTarget[0].classList.remove("hj__selector");
    }
    if (hjSelect.length > 0) {
      hjSelect[0].remove();
    }
  };

  const pageClickListener = () => {
    clearPreviousSelection();
    if (document.getSelection().anchorNode) {
      let el = document.getSelection().anchorNode.parentElement;
      // add class to highlighted element
      el.classList.add("hj__selector");
      useState(() => (state.selectedElm = el.tagName));
      document.removeEventListener("click", pageClickListener);

      if (state.selectedElm !== "") {
        appendOptions();
      }
    }
  };

  const displayFunnels = (funnel) => {
    return funnel
      ?.map(({ id, pageURL, interaction }, index) => {
        return `<div class='widget__item' id='${id}'>
      <div class='item__details'>
      <span class='item__count'>${index + 1}</span>
        <div class='detail'>
          <h3>${pageURL ?? ""}</h3>
          <p>${interaction}</p>
        </div>
        <span class="item__close" id=${id}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0C3.57333 0 0 3.57333 0 8C0 12.4267 3.57333 16 8 16C12.4267 16 16 12.4267 16 8C16 3.57333 12.4267 0 8 0ZM10.3111 11.3778C9.54667 10.6133 8.76444 9.83111 8 9.06667C7.23556 9.83111 6.45333 10.6133 5.68889 11.3778C4.99556 12.0711 3.94667 11.0044 4.62222 10.3111C5.38667 9.54667 6.16889 8.76444 6.93333 8C6.16889 7.23556 5.38667 6.45333 4.62222 5.68889C3.92889 4.99556 4.99556 3.94667 5.68889 4.62222C6.45333 5.38667 7.23556 6.16889 8 6.93333C8.76444 6.16889 9.54667 5.38667 10.3111 4.62222C11.0044 3.92889 12.0533 4.99556 11.3778 5.68889C10.6133 6.45333 9.83111 7.23556 9.06667 8C9.83111 8.76444 10.6133 9.54667 11.3778 10.3111C12.0533 10.9867 10.9867 12.0533 10.3111 11.3778Z" fill="#CCCCCC"/>
          </svg>
        </span>
      </div>
    </div>`;
      })
      .join("");
  };

  const hideWidget = () => {
    const container = document.querySelector(".widget__container");
    container.classList.add("hide");
  };

  const saveFunnel = () => {
    let firstCall = true;
    useState(() => (state.isSubmitting = true));
    if (firstCall) {
      api.submit([
        {
          type: api.VISITED_URL,
          payload: PERSISTED_STATE.funnels,
        },
        {
          type: api.FOCUS,
          payload: "body",
        },
        {
          type: api.CLICK,
          payload: "#save-funnel",
        },
      ]);
      firstCall = false;
    } else {
      api.submit([
        {
          type: api.VISITED_URL,
          payload: "http://www.hotjar.com/tour",
        },
      ]);
    }
  };

  const removeFunnel = (ev) => {
    const filterFunnel = PERSISTED_STATE.funnels.filter(
      (funnel) => funnel.id !== Number(ev.target.id)
    );
    if (filterFunnel) {
      setState({ ...PERSISTED_STATE, funnels: filterFunnel });
    }
  };

  const renderDom = () => {
    PERSISTED_STATE = getState();

    document.querySelector("body").innerHTML += `
      <div id="hotjar__widget" >
        <div  class="widget__container">
          <button id="close-widget" class="close__widget">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="13" cy="13" r="13" fill="#F4364C"/>
            <path d="M7 17.4954C7 17.0757 7.15166 16.7141 7.45499 16.4108L10.8658 13L7.45499 9.57174C7.15166 9.28005 7 8.92435 7 8.50464C7 8.08492 7.15166 7.72922 7.45499 7.43753C7.75832 7.14584 8.11402 7 8.52209 7C8.93017 7 9.28587 7.14584 9.5892 7.43753L13.0175 10.8658L16.4283 7.43753C16.7199 7.14584 17.0757 7 17.4954 7C17.9151 7 18.2708 7.14584 18.5625 7.43753C18.8542 7.72922 19 8.08492 19 8.50464C19 8.92435 18.8542 9.28005 18.5625 9.57174L15.1517 13L18.5625 16.4108C18.8542 16.7141 19 17.0757 19 17.4954C19 17.9151 18.8542 18.2708 18.5625 18.5625C18.2708 18.8542 17.9151 19 17.4954 19C17.0757 19 16.7199 18.8542 16.4283 18.5625L13.0175 15.1517L9.5892 18.5625C9.29751 18.8542 8.94181 19 8.52209 19C8.10238 19 7.74668 18.8542 7.45499 18.5625C7.15166 18.2591 7 17.9034 7 17.4954Z" fill="white"/>
          svg>

          </button>
          <div class="widget__heading">
            <div class="widget__title__heading">
              <p class="widget__title">Build your funnel</p>
              <span class="widget__badge">2 Steps</span>
            </div>
            <div class="widget__info__heading">
              <span class="widget__info__icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.9995 0C3.5815 0 0 3.5815 0 7.9995C0 12.4175 3.5815 16 7.9995 16C12.4175 16 16 12.4175 16 7.9995C16 3.5815 12.4175 0 7.9995 0ZM7.9995 2.94952C8.688 2.94952 9.2475 3.50752 9.2475 4.19652C9.2475 4.88552 8.6885 5.44352 7.9995 5.44352C7.311 5.44352 6.7525 4.88552 6.7525 4.19652C6.7525 3.50752 7.3105 2.94952 7.9995 2.94952ZM8.8215 6.60402C8.6075 6.39652 8.3045 6.27502 7.9995 6.27502H7.999C7.694 6.27502 7.392 6.39652 7.178 6.60402C6.964 6.81152 6.841 7.10252 6.8455 7.39402V11.9315C6.8415 12.22 6.962 12.509 7.1725 12.716C7.383 12.923 7.68 13.046 7.982 13.0505C8.2895 13.055 8.598 12.9355 8.8155 12.7275C9.033 12.5195 9.1575 12.2255 9.153 11.9315V7.39402C9.1575 7.10302 9.0355 6.81152 8.8215 6.60402Z" fill="#999999"/>
                </svg>

              </span>
              <p>Navigate through your site and add the steps that will make up this funnel.</p>
            </div>
          </div>
          <div class="widget__list">${displayFunnels(
            PERSISTED_STATE.funnels
          )}</div>
          <div class="btn__container"> 
            <button id="save-funnel"> 
            ${state.isSubmitting ? "Saving  Funnel..." : "Save Funnel"}
            </button> 
          </div>
        </div>
      </div>
    `;

    const closeWidget = document.getElementById("close-widget");
    const saveWidget = document.getElementById("save-funnel");
    const removeItem = document.querySelectorAll(".item__close");
    document
      .querySelector(".widget__container")
      .removeEventListener("click", pageClickListener);

    closeWidget.addEventListener("click", hideWidget);
    saveWidget.addEventListener("click", saveFunnel);

    if (removeItem.length > 0) {
      removeItem.forEach((item) =>
        item.addEventListener("click", removeFunnel)
      );
    }
  };

  const reset = () => {
    useState(() => {
      state.selectedElm = "";
    });
    clearPreviousSelection();
    document.addEventListener("click", pageClickListener);
  };

  const handleSelectedInteraction = (ev) => {
    const { value } = ev.target;

    updateFunnel(value);
    reset();
  };

  const updateFunnel = (selectedInteraction) => {
    setState({
      ...PERSISTED_STATE,
      funnels: [
        ...PERSISTED_STATE.funnels,
        {
          id: PERSISTED_STATE.funnels.length + 1,
          element: state.selectedElm,
          interaction: selectedInteraction,
          pageURL: window.location.href,
        },
      ],
    });
  };

  // append options to selected element
  const appendOptions = () => {
    const parentElm = document.getElementsByClassName("hj__selector");
    const selectElm = document.createElement("div");

    if (parentElm.length > 0) {
      if (FORM_INPUTS.includes(state.selectedElm)) {
        selectElm.innerHTML += `
        <select name="hj__select" class=" hj__select" placeholder="Select an action" id="">
          <option value="">Select an action</option>
          <option value="change">Change</option>
          <option value="keypress">Key press</option>
          <option value="focus">Focus</option>
        </select>
      `;
      } else {
        selectElm.innerHTML += `
        <select name="hj__select" class="hj__select">
          <option value="">Select an action</option>
          <option value="viewed">User visits current page</option>
          <option value="clicked">User interacts with element</option>
        </select>
        `;
      }
    }
    parentElm && parentElm[0]?.after(selectElm);

    const select = document.querySelector(".hj__select");
    if (select) {
      select.addEventListener("change", handleSelectedInteraction);
    }
  };

  function setState(stateData) {
    saveState(stateData);
    loadState();
    renderDom();
  }

  function useState(callback) {
    callback();
    // renderDom();
  }
  app();
})();
