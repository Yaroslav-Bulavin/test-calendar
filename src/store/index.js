import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentDate: new Date(),
    selectDate: new Date(),
  },
  mutations: {
    stepMonthFrontMutation(state) {
      state.currentDate = new Date(
        state.currentDate.setMonth(state.currentDate.getMonth() + 1)
      );
    },
    stepMonthBackMutation(state) {
      state.currentDate = new Date(
        state.currentDate.setMonth(state.currentDate.getMonth() - 1)
      );
    },
    goToTodayMutation(state) {
      state.currentDate = new Date();
      state.selectDate = new Date();
    },
    changeSelectDayMutation(state, data) {
      state.selectDate = new Date(data);
    },
    saveEventMutation(state, event) {
      state.events.set(event.key, [event]);
    },
  },
  actions: {
    stepMonthFront({ commit }) {
      commit("stepMonthFrontMutation");
    },
    stepMonthBack({ commit }) {
      commit("stepMonthBackMutation");
    },
    goToToday({ commit }) {
      commit("goToTodayMutation");
    },
    changeSelectDay({ commit }, data) {
      commit("changeSelectDayMutation", data);
    },
    saveEvent(context, event) {
      if (localStorage.getItem(event.key) == null) {
        const newArr = [];
        newArr.push(event);
        localStorage.setItem(event.key, JSON.stringify(newArr));
        location.reload();
      } else {
        const arrFromStorage = localStorage.getItem(event.key);
        const arr = JSON.parse(arrFromStorage);
        arr.push(event);
        localStorage.setItem(event.key, JSON.stringify(arr));
        location.reload();
      }
    },
    editEvent(context, { params, index }) {
      const elem = localStorage.getItem(params.key);
      let parsElem = JSON.parse(elem);
      parsElem[index] = params;
      localStorage.setItem(params.key, JSON.stringify(parsElem));
      location.reload();
    },
    delEvent(context, { event, index }) {
      const elem = localStorage.getItem(event.key);
      let parsElem = JSON.parse(elem);
      parsElem.splice(index, 1);
      localStorage.setItem(event.key, JSON.stringify(parsElem));
      location.reload();
    },
  },
  getters: {
    currentDate: (state) => state.currentDate,
    selectDate: (state) => state.selectDate,
  },
  modules: {},
});
