// flat lib has es6mudule in js file so we should compile
const esModules = ["flat"].join("|");

export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
};
