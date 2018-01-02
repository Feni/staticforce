import {Environment, Cell} from '../engine'
import {} from 'jest';
// import {test, expect, toBe} from 'jest'

/* Environment tests */
// Test getting a variable in direct environment
test('find variable in direct environment', () => {
  let e = new Environment()
  let c = new Cell(42, "number", e);
  e.set("a", c)
  expect(e.findEnv("a")).toBe(e);  // Get correct env
  expect(e.findEnv("a").get("a")).toBe(c); // get correct cell
  expect(e.findValue("a")).toBe(c); // find + get
  expect(e.findEnv("a").get("a").value).toBe(42);  // Verify value
});

// Test getting in parent environment
test('find variable in parent environment', () => {
  let parentEnv = new Environment();
  let childEnv = new Environment(parentEnv);
  let c = new Cell(42, "number", parentEnv);
  parentEnv.set("a", c);

  expect(childEnv.findEnv("a")).toBe(parentEnv);  // Get correct env
  expect(parentEnv.findEnv("a")).toBe(parentEnv);  // Get correct env

  expect(childEnv.findEnv("a").get("a")).toBe(c); // get correct cell
  expect(parentEnv.findEnv("a").get("a")).toBe(c); // get correct cell

  expect(childEnv.findValue("a")).toBe(c); // find + get

  expect(childEnv.findEnv("a").get("a").value).toBe(42);  // Verify value
});

// Testing getting in several layers deep
test('find variable in deep environment', () => {
  let e1 = new Environment();
  let e2 = new Environment(e1);
  let e3 = new Environment(e2);
  let e4 = new Environment(e3);
  let e5 = new Environment(e4);
  let e6 = new Environment(e5);
  let c = new Cell(42, "number", e2);
  e2.set("a", c);

  expect(e5.findEnv("a")).toBe(e2);  // Get correct env
  expect(e1.findEnv("a")).toBe(undefined);  // Or namespace error in future

  expect(e6.findValue("a")).toBe(c); // find + get

});

// Test variable not found.
test('find variable not found', () => {
  let e = new Environment()
  let c = new Cell(42, "number", e);
  e.set("a", c)

  // TODO: This should probably raise an error instead.
  expect(e.findEnv("b")).toBe(undefined);
  expect(e.findValue("b")).toBe(undefined);
});

// Test variable found in multiple environments & proper one returned.
test('find variable in multiple scopes', () => {
  let e1 = new Environment();
  let e2 = new Environment(e1);
  let e3 = new Environment(e2);
  let e4 = new Environment(e3);
  let e5 = new Environment(e4);
  let e6 = new Environment(e5);
  
  let c1 = new Cell(42, "number", e2);
  e2.set("a", c1);

  let c2 = new Cell(42, "number", e4);
  e4.set("a", c2);


  expect(e1.findEnv("a")).toBe(undefined);
  expect(e1.findValue("a")).toBe(undefined);

  expect(e2.findEnv("a")).toBe(e2);
  expect(e2.findValue("a")).toBe(c1);

  expect(e3.findEnv("a")).toBe(e2);
  expect(e3.findValue("a")).toBe(c1);

  // Return the local variable rather than one in higher scope.
  expect(e4.findEnv("a")).toBe(e4);
  expect(e4.findValue("a")).toBe(c2);

  expect(e5.findEnv("a")).toBe(e4);
  expect(e5.findValue("a")).toBe(c2);


});