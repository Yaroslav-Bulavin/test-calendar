<template>
  <header class="container">
    <div class="container_wrapper">
      <div>
        <button class="button" @click="getElem" ref="addButton">
          Добавить
        </button>
        <button class="button" @click="deleteAll">Очистить всё</button>
      </div>
      <div class="search_wrapper">
        <input
          class="search"
          type="search"
          v-model="search"
          placeholder="Событие, дата или участник"
          @blur="blur"
        />
        <i class="fas fa-search" aria-hidden="true"></i>

        <div class="search-result" v-if="searchResult.length > 0">
          <div
            v-for="(item, index) in searchResult"
            :key="index"
            class="search-result__item"
          >
            <div>
              <div>{{ item.name }}</div>
              <small>{{ item.date }}</small>
            </div>
          </div>
        </div>
        <div v-if="searchResult.length == 0 && notFound" class="search-result">
          <div class="search-result__item">not found</div>
        </div>
      </div>
    </div>
    <div
      class="modal"
      v-if="dateModal"
      :style="{ top: itemTop + 'px', left: itemLeft + 'px' }"
    >
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
              v-model="date"
              class="add-date"
              :class="{ error: dateError }"
            />
            <small v-if="dateError">Это поле является обязательным</small>
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
  </header>
</template>

<script>
export default {
  data() {
    return {
      search: "",
      searchResult: [],
      notFound: false,
      dateModal: false,
      event: "",
      date: "",
      memberNames: "",
      description: "",
      eventError: false,
      membersError: false,
      descError: false,
      dateError: false,
      itemTop: "",
      itemLeft: "",
      selectElem: null,
    };
  },
  watch: {
    search: function () {
      this.searchResult = [];
      let keys = Object.keys(localStorage);
      const reg = /^\d{2}[./-]\d{2}[./-]\d{4}$/;
      const result = keys.filter((item) => {
        return reg.test(item);
      });
      for (let i = 0; i < result.length; i++) {
        const element = result[i];
        const eventKey = JSON.parse(localStorage.getItem(element));
        for (let y = 0; y < eventKey.length; y++) {
          const elementY = eventKey[y];
          if (elementY.name.includes(this.search)) {
            this.notFound = false;
            if (this.search) {
              this.searchResult.push({
                name: elementY.name,
                date: elementY.key,
              });
            }
          } else {
            this.notFound = true;
          }
        }
      }
    },
  },
  methods: {
    blur() {
      this.search = "";
      this.notFound = false;
    },
    deleteAll() {
      localStorage.clear();
      location.reload();
    },
    getElem() {
      const elem = this.$refs.addButton.getBoundingClientRect();
      this.getModalDate(elem);
      this.eventError = false;
      this.membersError = false;
      this.descError = false;
      this.dateError = false;
    },
    getModalDate(elem) {
      console.log(elem);
      this.dateModal = true;
      this.itemTop = elem.top + elem.height + 5;
      this.itemLeft = elem.left - 10;
    },
    save() {
      let params = {};
      params["key"] = this.formatDate(new Date(this.date));
      params["name"] = this.event;
      params["description"] = this.description;
      params["members"] = this.memberNames;
      if (this.validate()) {
        this.$store.dispatch("saveEvent", params);
        this.dateModal = false;
        this.event = "";
        this.description = "";
        this.memberNames = "";
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
      this.dateError = false;
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
    isValidDate() {
      if (!this.date) {
        this.dateError = true;
        return false;
      } else {
        return true;
      }
    },
    validate() {
      this.isValidEvent();
      this.isValidDesc();
      this.isValidMembers();
      this.isValidDate();
      if (
        this.isValidEvent() &&
        this.isValidDesc() &&
        this.isValidMembers() &&
        this.isValidDate()
      ) {
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
  width: 100%;
  height: 100px;
  background-color: #ccc;
  -webkit-box-shadow: 0px 5px 10px 2px rgba(34, 60, 80, 0.19);
  -moz-box-shadow: 0px 5px 10px 2px rgba(34, 60, 80, 0.19);
  box-shadow: 0px 5px 10px 2px rgba(34, 60, 80, 0.19);
  margin-bottom: 20px;
  &_wrapper {
    width: 80%;
    height: 100%;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .button {
      background-color: black;
      color: white;
      padding: 10px;
      outline: none;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    .button + .button {
      margin-left: 10px;
    }
    .search_wrapper {
      position: relative;
      .search {
        padding: 10px;
        border: none;
        outline: none;
        border-radius: 5px;
        width: 250px;
        padding-left: 35px;
      }
      i.fas {
        position: absolute;
        top: 10px;
        left: 10px;
        margin-right: 15px;
      }
      .search-result {
        position: absolute;
        width: 250px;
        background-color: #000;
        margin-top: 10px;
        max-height: 400px;
        overflow-y: auto;
        &__item {
          height: 50px;
          background-color: #fff;
          width: 100%;
          padding: 5px;
          box-sizing: border-box;
          border-bottom: 1px solid #ccc;
          -webkit-box-shadow: 4px 4px 8px 0px rgba(34, 60, 80, 0.2);
          -moz-box-shadow: 4px 4px 8px 0px rgba(34, 60, 80, 0.2);
          box-shadow: 4px 4px 8px 0px rgba(34, 60, 80, 0.2);
        }
      }
    }
  }
  .modal {
    position: absolute;
    border: 1px solid black;
    width: 250px;
    background-color: #fff;
    margin-left: 10px;
    .content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      small {
        color: red;
      }
      &_inner {
        padding: 10px 20px;
        &-item {
          width: 100%;
          input {
            width: 100%;
            max-width: 202px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
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
}
</style>
