/** Customer for Lunchly */

const db = require('../db');
const Reservation = require('./reservation');

/** Customer of the restaurant. */

class Customer {
	constructor({ id, prefix, firstName, lastName, phone, notes }) {
		this.id = id;
		this.prefix = prefix;
		this.firstName = firstName;
		this.lastName = lastName;
		this.phone = phone;
		this.notes = notes;
	}

	/** find all customers. */

	static async all() {
		const results = await db.query(
			`SELECT id, 
		prefix,
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
		);
		return results.rows.map((c) => new Customer(c));
	}

	/** get a customer by ID. */

	static async get(id) {
		const results = await db.query(
			`SELECT id, 
			prefix,
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
			[
				id
			]
		);

		const customer = results.rows[0];

		if (customer === undefined) {
			const err = new Error(`No such customer: ${id}`);
			err.status = 404;
			throw err;
		}

		return new Customer(customer);
	}

	/** get all reservations for this customer. */

	async getReservations() {
		return await Reservation.getReservationsForCustomer(this.id);
	}

	/** save this customer. */

	async save() {
		if (this.id === undefined) {
			const result = await db.query(
				`INSERT INTO customers (prefix, first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
				[
					this.prefix,
					this.firstName,
					this.lastName,
					this.phone,
					this.notes
				]
			);
			this.id = result.rows[0].id;
		}
		else {
			await db.query(
				`UPDATE customers SET prefix=$1, first_name=$2, last_name=$3, phone=$4, notes=$5
             WHERE id=$6`,
				[
					this.prefix,
					this.firstName,
					this.lastName,
					this.phone,
					this.notes,
					this.id
				]
			);
		}
	}
	getFullName(id) {
		if (!this.prefix) {
			this.prefix = '';
		}
		return `${this.prefix} ${this.firstName} ${this.lastName}`;
	}
}

module.exports = Customer;
