<template>
    <div
        class="uk-position-absolute uk-panel uk-box-shadow-large suggestions-container"
        :style="[{ background: secondaryBackgroundColor }]"
    >
        <ul class="uk-list uk-margin-remove uk-text-secondary">
            <li
                v-for="(suggestion, i) in searchSuggestions"
                :key="i"
                :style="[selected === i ? { background: secondaryForegroundColor } : {}]"
                @mouseover="onMouseOver(i)"
                @mousedown.stop="onClick(i)"
                class="uk-margin-remove suggestion"
            >
                {{ suggestion }}
            </li>
        </ul>
    </div>
</template>

<script>
export default {
  props: {
    searchText: String
  },
  data () {
    return {
      selected: 0,
      searchSuggestions: []
    }
  },
  methods: {
    onKeyUp (e) {
      if (e.key === 'ArrowUp') {
        if (this.selected <= 0) {
          this.setSelected(this.searchSuggestions.length - 1)
        } else {
          this.setSelected(this.selected - 1)
        }
        e.preventDefault()
      } else if (e.key === 'ArrowDown') {
        if (this.selected >= this.searchSuggestions.length - 1) {
          this.setSelected(0)
        } else {
          this.setSelected(this.selected + 1)
        }
        e.preventDefault()
      } else {
        this.refreshSuggestions()
      }
    },
    async refreshSuggestions () {
      this.searchSuggestions = await this.fetchJson(this.apiUrl() + '/suggestions', {
        query: this.searchText
      })
      this.searchSuggestions.unshift(this.searchText)
      this.setSelected(0)
    },
    onMouseOver (i) {
      if (i !== this.selected) {
        this.selected = i
      }
    },
    onClick (i) {
      this.setSelected(i)
      this.$router.push({
        name: 'SearchResults',
        query: { search_query: this.searchSuggestions[i] }
      })
    },
    setSelected (val) {
      this.selected = val
      this.$emit('searchchange', this.searchSuggestions[this.selected])
    }
  }
}
</script>

<style>
.suggestions-container {
    left: 50%;
    transform: translateX(-50%);
    max-width: 640px;
    width: 100%;
    box-sizing: border-box;
    padding: 5px 0;
    z-index: 10;
}
.suggestion {
    padding: 4px 15px;
}
@media screen and (max-width: 959px) {
    .suggestions-container {
        max-width: calc(100% - 60px);
    }
}
@media screen and (max-width: 639px) {
    .suggestions-container {
        max-width: calc(100% - 30px);
    }
}
</style>
