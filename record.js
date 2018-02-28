class Record {
	constructor(date, base, quote, price) {
		this.data = date;
		this.base = base;
		this.quote = quote;
		this.price = price;
	}

	get() {
		return {
			date: this.data,
			base: this.base,
			quote: this.quote,
			price: this.price
		}
	}

}