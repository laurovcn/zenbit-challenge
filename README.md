## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

```bash
# to sync your database
$ npx prisma db push
```
# zenbit-challenger


# Code Explanation

# The code achieves the objective through the following steps:

- Obtain the current date using Day.js.
- Set the start date of the current year by using the startOf('year') method of Day.js to get the first day of the year.
- Set the end date of the current year by using the endOf('year') method of Day.js to get the last day of the year.
- Create a yearPeriod object containing the start and end properties, representing the start and end dates of the current year in Date format.
- Print the current date to the console (for debugging or informational purposes only).
- The code continues from this point onward, with the aim of calculating the sum of the period_amount_extend values for the active leases within the current year.
- The code prepares the time period for the current year and sets the date range to filter the active leases. Subsequently, it retrieves the period_amount_extend values for each active lease and calculates the total sum. The resulting value represents the total sum of all period_amount_extend values for the active leases within the current year.

# Routes: 
- /api to see documentation

- /leases/total-amount'
Params: clientUuid