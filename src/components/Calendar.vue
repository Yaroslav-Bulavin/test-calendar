<template>
  <div class="container">
    <div class="container_wrapper">
      <div class="trigger_date_wrapper">
        <button @click="stepMonthBack">
          <i class="fas fa-caret-left"></i>
        </button>
        <p style="padding: 0 20px">
          {{ currentMonthTitle }}, {{ currentYear }}
        </p>
        <button @click="stepMonthFront" style="margin-right: 20px">
          <i class="fas fa-caret-right"></i>
        </button>
        <button @click="goToToday">Сегодня</button>
      </div>
      <div class="days-of-week_wrapper">
        <div class="item" v-for="day of dayOfWeek" :key="day">
          {{ day }}
        </div>
      </div>
      <div class="days-item_wrapper">
        <div
          class="item"
          ref="day"
          :class="{
            selectItem: day
              ? selectDate.getDate() == day.id.getDate() &&
                selectDate.getMonth() == day.id.getMonth()
              : false,
            haveEvent: day ? day.events : false,
          }"
          v-for="(day, index) of calendarDays"
          :key="index"
          @click="getElem(index, day)"
        >
          <div class="day-header">
            <div>{{ day ? day.id.getDate() : null }}</div>
            <div :class="{ 'events-length': needShow(day) }">
              {{ needShow(day) }}
            </div>
          </div>
          <div
            v-for="(event, index) of dayEvents(day ? day.events : [])"
            :key="index"
            class="day-item"
          >
            {{ event.name }}
          </div>
          <div v-if="hasEvents(day)">...</div>
          <!-- <div @click="log(day)">...</div> -->
        </div>
      </div>
    </div>

    <!-- modal-start -->
    <div
      class="modal"
      v-if="dateModal"
      :style="{ top: itemTop + 'px', left: itemLeft + 'px' }"
    >
      <div class="header">
        <p>{{ formatDate(selectElem.id) }}</p>
        <i @click="cancel" class="fas fa-times"></i>
        <div class="triangle-left"></div>
      </div>
      <div v-if="selectElem.events && fromButton">
        <div class="content">
          <div class="content_inner">
            <div class="content_inner-item">
              <input
                type="text"
                placeholder="Событие "
                v-model="event"
                class="add-event"
                :class="{ error: eventError }"
              />
              <small v-if="eventError">Это поле является обязательным</small>
            </div>
            <div class="content_inner-item">
              <input
                type="date"
                :value="formatDate(selectElem.id, true)"
                class="add-date"
                disabled
              />
            </div>
            <div class="content_inner-item">
              <input
                type="text"
                placeholder="Имена учатников"
                v-model="memberNames"
                class="add-names"
                :class="{ error: membersError }"
              />
              <small v-if="membersError">Это поле является обязательным</small>
            </div>

            <div class="content_inner-item">
              <textarea
                name="description"
                id="description"
                cols="20"
                rows="10"
                v-model="description"
                class="add-descr"
                :class="{ error: descError }"
              ></textarea>
              <small v-if="descError">Это поле является обязательным</small>
            </div>
          </div>
        </div>
        <div class="footer">
          <button @click="save" class="footer__btn-save">Сохранить</button>
          <button @click="cancel" class="footer__btn-cancel">Отменить</button>
        </div>
      </div>
      <div v-if="!selectElem.events">
        <div class="content">
          <div class="content_inner">
            <div class="content_inner-item">
              <input
                type="text"
                placeholder="Событие "
                v-model="event"
                class="add-event"
                :class="{ error: eventError }"
              />
              <small v-if="eventError">Это поле является обязательным</small>
            </div>
            <div class="content_inner-item">
              <input
                type="date"
                :value="formatDate(selectElem.id, true)"
                disabled
                class="add-date"
              />
            </div>
            <div class="content_inner-item">
              <input
                type="text"
                placeholder="Имена учатников"
                v-model="memberNames"
                class="add-names"
                :class="{ error: membersError }"
              />
              <small v-if="membersError">Это поле является обязательным</small>
            </div>
            <div class="content_inner-item">
              <textarea
                name="description"
                id="description"
                cols="20"
                rows="10"
                v-model="description"
                class="add-descr"
                :class="{ error: descError }"
              ></textarea>
              <small v-if="descError">Это поле является обязательным</small>
            </div>
          </div>
        </div>
        <div class="footer">
          <button @click="save" class="footer__btn-save">Сохранить</button>
          <button @click="cancel" class="footer__btn-cancel">Отменить</button>
        </div>
      </div>
      <div
        v-if="selectElem.events && !fromButton"
        :class="{ scroll: selectElem.events.length > 2 }"
      >
        <div
          v-for="(event, index) in selectElem.events"
          :key="index"
          class="event-wrapper"
        >
          <div class="event-wrapper__item">
            <i class="far fa-star" style="margin-right: 5px"></i
            >{{ event.name }}
          </div>
          <div class="event-wrapper__item">
            <i class="far fa-calendar-alt" style="margin-right: 5px"></i
            >{{ event.key }}
          </div>
          <div class="event-wrapper__item">
            <i class="far fa-user" style="margin-right: 5px"></i
            >{{ event.members }}
          </div>
          <div class="event-btns">
            <div>
              <i
                class="fas fa-pen event-btns__edit"
                @click="editEvent(event, index)"
              ></i>
            </div>
            <div>
              <i
                class="far fa-trash-alt event-btns__delete"
                @click="delEvent(event, index)"
              ></i>
            </div>
          </div>
        </div>
        <div class="btn-wrapper">
          <button @click="fromButton = !fromButton" class="btn-wrapper__item">
            Создать событие на {{ formatDate(selectElem.id) }}
          </button>
        </div>
      </div>
    </div>
    <!-- modal-end -->
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      event: "",
      eventError: false,
      memberNames: "",
      membersError: false,
      description: "",
      descError: false,
      date: "",
      itemTop: "",
      itemBottom: "",
      itemLeft: "",
      itemRight: "",
      dayOfWeek: [
        "Понедельник",
        "Вторник",
        "Среда",
        "Четверг",
        "Пятница",
        "Суббота",
        "Воскресенье",
      ],
      monthNames: [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь",
      ],
      dateModal: false,
      selectElem: null,
      commonError: false,
      fromButton: false,
      edit: false,
      editIndex: null,
    };
  },
  mounted() {},
  computed: {
    ...mapGetters(["currentDate", "selectDate"]),
    currentMonthTitle() {
      let currectMonth = this.monthNames[this.currentDate.getMonth()];
      return currectMonth;
    },
    currentMonth() {
      return this.currentDate.getMonth();
    },
    currentYear() {
      let currectYear = this.currentDate.getFullYear();
      return currectYear;
    },
    startWeek() {
      return new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        1
      ).getDay();
    },

    calendarDays() {
      let days = [];
      let dlast = new Date(
        this.currentYear,
        this.currentMonth + 1,
        0
      ).getDate();

      for (let i = 1; i <= dlast; i++) {
        let result = localStorage.getItem(
          this.formatDate(new Date(this.currentYear, this.currentMonth, i))
        );
        days.push({
          id: new Date(this.currentYear, this.currentMonth, i),
          events: JSON.parse(result),
        });
      }

      for (let i = 1; i < this.getStartWeekIndex(this.startWeek); i++) {
        days.unshift(null);
      }
      return days;
    },
  },
  methods: {
    needShow(day) {
      return day ? (day && day.events ? day.events.length : null) : null;
    },
    hasEvents(day) {
      if (day && day.events) {
        if (day.events.length > 3) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    dayEvents(events) {
      let arr = [];
      if (events) {
        arr = events.slice(0, 3);
      }
      return arr;
    },
    stepMonthBack() {
      this.$store.dispatch("stepMonthBack");
      this.dateModal = false;
    },
    stepMonthFront() {
      this.$store.dispatch("stepMonthFront");
      this.dateModal = false;
    },
    goToToday() {
      this.$store.dispatch("goToToday");
      this.dateModal = false;
    },
    changeSelectDay(data) {
      this.$store.dispatch("changeSelectDay", data);
    },
    getStartWeekIndex(data) {
      switch (data) {
        case 0:
          return 7;
        default:
          return data;
      }
    },
    getElem(index, day) {
      if (day) {
        const elem = this.$refs.day[index].getBoundingClientRect();
        this.getModalDate(elem);
        if (this.fromButton) {
          this.fromButton = false;
        }
        this.selectElem = day;
        this.eventError = false;
        this.membersError = false;
        this.descError = false;
        this.event = "";
        this.description = "";
        this.memberNames = "";
      } else {
        this.dateModal = false;
      }
    },
    editEvent(event, index) {
      this.fromButton = true;
      this.edit = true;
      this.event = event.name;
      this.description = event.description;
      this.memberNames = event.members;
      this.editIndex = index;
    },
    delEvent(event, index) {
      this.$store.dispatch("delEvent", { event, index });
    },

    getModalDate(elem) {
      this.dateModal = true;
      this.itemTop = elem.top;
      this.itemLeft = elem.left + elem.width;
    },
    save() {
      let params = {};
      params["key"] = this.formatDate(this.selectElem.id);
      params["name"] = this.event;
      params["description"] = this.description;
      params["members"] = this.memberNames;
      if (this.validate()) {
        if (!this.edit) {
          this.$store.dispatch("saveEvent", params);
          this.dateModal = false;
          this.event = "";
          this.description = "";
          this.memberNames = "";
        } else {
          this.$store.dispatch("editEvent", { params, index: this.editIndex });
          this.dateModal = false;
          this.event = "";
          this.description = "";
          this.memberNames = "";
          this.edit = false;
        }
      }
    },
    cancel() {
      this.dateModal = false;
      this.event = "";
      this.description = "";
      this.memberNames = "";
      this.eventError = false;
      this.membersError = false;
      this.descError = false;
    },
    isValidEvent() {
      if (!this.event) {
        this.eventError = true;
        return false;
      } else {
        return true;
      }
    },
    isValidDesc() {
      if (!this.description) {
        this.descError = true;
        return false;
      } else {
        return true;
      }
    },
    isValidMembers() {
      if (!this.memberNames) {
        this.membersError = true;
        return false;
      } else {
        return true;
      }
    },
    validate() {
      this.isValidEvent();
      this.isValidDesc();
      this.isValidMembers();
      if (this.isValidEvent() && this.isValidDesc() && this.isValidMembers()) {
        return true;
      } else {
        return false;
      }
    },
    formatDate(date, params = null) {
      if (date) {
        if (params) {
          let dd = date.getDate();
          if (dd < 10) dd = "0" + dd;

          let mm = date.getMonth() + 1;
          if (mm < 10) mm = "0" + mm;

          let yy = date.getFullYear();

          return yy + "-" + mm + "-" + dd;
        } else {
          let dd = date.getDate();
          if (dd < 10) dd = "0" + dd;

          let mm = date.getMonth() + 1;
          if (mm < 10) mm = "0" + mm;

          let yy = date.getFullYear();

          return dd + "." + mm + "." + yy;
        }
      } else {
        this.dateModal = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  .modal {
    position: absolute;
    border: 1px solid black;
    width: 250px;
    background-color: #fff;
    margin-left: 10px;

    .scroll {
      height: 300px;
      overflow-y: scroll;
    }
    .btn-wrapper {
      display: flex;
      justify-content: center;
      padding-bottom: 10px;
      &__item {
        border: 0;
        font-size: 13px;
        color: #fff;
        border-radius: 5px;
        background: #380996;
        padding: 7px 10px;
      }
    }
    .event-wrapper {
      padding: 10px;
      &__item {
        padding-bottom: 7px;
      }
      .event-btns {
        display: flex;
        justify-content: flex-end;
        padding-bottom: 10px;
        border-bottom: 1px solid grey;
        &__edit {
          margin-right: 10px;
          cursor: pointer;
        }
        &__delete {
          cursor: pointer;
        }
      }
    }
    .content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      &_inner {
        padding: 10px 20px;
        &-item {
          width: 100%;
          small {
            color: red;
          }
          input {
            width: 100%;
            max-width: 202px;
            border: 1px solid #ccc;
            margin-bottom: 5px;
            border-radius: 3px;
            height: 22px;
          }

          .add-date {
            width: 100%;
            max-width: 202px;
          }
          .add-descr {
            resize: none;
            width: 100%;
            max-width: 202px;
            border: 1px solid #ccc;
            border-radius: 3px;
          }
          .error {
            border: 2px solid red;
          }
        }
      }
    }
    .footer {
      display: flex;
      justify-content: center;
      padding-bottom: 20px;
      &__btn-save {
        margin-right: 10px;
        border: 0;
        background: #380996;
        width: 100px;
        height: 30px;
        border-radius: 5px;
        color: #fff;
        cursor: pointer;
      }
      &__btn-cancel {
        border: 0;
        background: #e4e4e4;
        width: 100px;
        height: 30px;
        border-radius: 5px;
        color: #000;
        cursor: pointer;
      }
    }
    .header {
      background-color: #000;
      height: 40px;
      color: white;
      display: flex;
      align-items: center;
      padding: 0 15px;
      justify-content: space-between;
      position: relative;
      .triangle-left {
        width: 0;
        height: 0;
        border-top: 20px solid transparent;
        border-right: 15px solid black;
        border-bottom: 20px solid transparent;
        position: absolute;
        top: 0;
        left: -16px;
      }
    }
  }

  &_wrapper {
    width: 80%;
    margin: 0 auto;

    .trigger_date_wrapper {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }
    .item {
      width: calc(100% / 7);
      height: 125px;
      border: 1px solid gray;
      padding: 5px;
      box-sizing: border-box;
      .day-header {
        display: flex;
        justify-content: space-between;
        .events-length {
          width: 15px;
          height: 15px;
          background-color: #000;
          color: #fff;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
      .day-item {
        border: 1px solid #000;
        padding: 2px;
        margin-bottom: 2px;
        border-radius: 5px;
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    .selectItem {
      border: 2px solid black;
    }
    .haveEvent {
      background-color: #00bfff;
    }
    .days-of-week_wrapper {
      display: flex;
    }
    .days-item_wrapper {
      display: flex;
      flex-wrap: wrap;
    }
  }
}
</style>
