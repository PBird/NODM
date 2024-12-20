import _ from "lodash";
import { flatten, unflatten } from "flat";
import { parseExpValue } from "../expressionHelpers";

const invoices = [
  {
    _id: "A1",
    item_name: "Blue box",
    price: 10,
    qty: 15,
    date_of_bill: "13/04/2015",
  },
  {
    _id: "A2",
    item_name: "Light Red box",
    price: 15,
    qty: 20,
    date_of_bill: "05/12/2014",
  },
  {
    _id: null,
    item_name: "Green box",
    price: 10,
    qty: 30,
    date_of_bill: "17/12/2014",
  },
  {
    _id: "A3",
    item_name: "White box",
    price: 8,
    qty: 25,
    date_of_bill: "07/02/2014",
  },
  {
    _id: "A4",
    item_name: "Blue box",
    price: 15,
    qty: 20,
    date_of_bill: "13/04/2015",
  },
  {
    _id: "A5",
    item_name: "Red box",
    price: 12,
    qty: 10,
    date_of_bill: "05/12/2014",
  },
  {
    _id: "A6",
    item_name: "Black box",
    price: 10,
    qty: 30,
    date_of_bill: "22/04/2020",
  },
  {
    _id: "A7",
    item_name: "Red box",
    price: 8,
    qty: 15,
    date_of_bill: "05/12/2014",
  },
  {
    _id: "A8",
    item_name: "Green box",
    price: 20,
    qty: 10,
    date_of_bill: "17/12/2014",
  },
  {
    _id: "A9",
    item_name: "Green box",
    price: 10,
    qty: 30,
    date_of_bill: "17/12/2014",
  },
  {
    _id: "A10",
    item_name: "Green box",
    price: 10,
    qty: 30,
    date_of_bill: undefined,
  },
];

// _.map(_.groupBy(invoices, "item_name"), (value,key) =>  ({ value, key }) )

const q = {
  date: "$date_of_bill",
  item: "$item_name",
};

const qres = _.map(q, (value, key) => {
  return;
});

export default function groupByMultiple(docs, obj) {
  let keys: Record<string, any> = {};

  if (obj._id === undefined) {
    throw new Error("a group specification must include an _id");
  } else {
    keys = flatten(obj);
  }

  return keys;
}

// const res = _.map(_.groupBy(invoices, "item_name"), (value, key) => {
//   return {
//     [key]: _.groupBy(value, "date_of_bill"),
//   };
// });

// console.log(res);

// console.log(_.mapValues(q));

// const flatq = flatten(["$item_name", "$date"], {
//   safe: true,
// });

// console.log(" flatten:", flatq);
// console.log(" unflattenflatten:", unflatten(flatq));
