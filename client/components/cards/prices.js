let priceColors;
Meteor.startup(() => {
  priceColors = Boards.simpleSchema()._schema['prices.$.color'].allowedValues;
});

BlazeComponent.extendComponent({
  template() {
    return 'formprice';
  },

  onCreated() {
    this.currentColor = new ReactiveVar(this.data().color);
  },

  prices() {
    return priceColors.map((color) => {
      return { color, name: '000' };
    });
  },

  isSelected(color) {
    return this.currentColor.get() === color;
  },

  events() {
    return [{
      'click .js-palette-color'() {
        this.currentColor.set(this.currentData().color);
      },
    }];
  },
}).register('formprice');

Template.createpricePopup.helpers({
  // This is the default color for a new price. We search the first color that
  // is not already used in the board (although it's not a problem if two
  // prices have the same color).
  defaultColor() {
    const prices = Boards.findOne(Session.get('currentBoard')).prices;
    const usedColors = _.pluck(prices, 'color');
    const availableColors = _.difference(priceColors, usedColors);
    return availableColors.length > 1 ? availableColors[0] : priceColors[0];
  },
});

Template.cardPricesPopup.events({
  'click .js-select-price'(evt) {
    const card = Cards.findOne(Session.get('currentCard'));
    const priceId = this._id;
    card.togglePrice(priceId);
    evt.preventDefault();
  },
  'click .js-edit-price': Popup.open('editprice'),
  'click .js-add-price': Popup.open('createprice'),
});

Template.formprice.events({
  'click .js-palette-color'(evt) {
    const $this = $(evt.currentTarget);

    // hide selected ll colors
    $('.js-palette-select').addClass('hide');

    // show select color
    $this.find('.js-palette-select').removeClass('hide');
  },
});

Template.createpricePopup.events({
  // Create the new price
  'submit .create-price'(evt, tpl) {
    evt.preventDefault();
    const board = Boards.findOne(Session.get('currentBoard'));
    const name = tpl.$('#priceName').val().trim();
	console.log('pablo : priceName : ' + name);
    const color = Blaze.getData(tpl.find('.fa-check')).color;
    board.addPrice(name, color);
    Popup.back();
  },
});

Template.editpricePopup.events({
  'click .js-delete-price': Popup.afterConfirm('deleteprice', function() {
    const board = Boards.findOne(Session.get('currentBoard'));
    board.removeprice(this._id);
    Popup.back(2);
  }),
  'submit .edit-price'(evt, tpl) {
    evt.preventDefault();
    const board = Boards.findOne(Session.get('currentBoard'));
    const name = tpl.$('#priceName').val().trim();
    const color = Blaze.getData(tpl.find('.fa-check')).color;
    board.editPrice(this._id, name, color);
    Popup.back();
  },
});

Template.cardPricesPopup.helpers({
  ispriceSelected(cardId) {
	console.log('cardPricesPopup, priceIds : ' + Cards.findOne(cardId).priceIds + ', this._id: ' + this._id);
    return _.contains(Cards.findOne(cardId).priceIds, this._id);
  },
});
