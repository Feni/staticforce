import {getEvalOrder, Environment, Cell, CellError} from '../engine'
import {} from 'jest';

// Test variable not found.
test('dependency order maintained', () => {
    let env = new Environment()
    let a = new Cell("A", "number", env);
    let b = new Cell("B", "number", env);
    let c = new Cell("C", "number", env);
    let d = new Cell("D", "number", env);
    let e = new Cell("E", "number", env);
    let f = new Cell("F", "number", env);
    
    // #       a 
    // #    b    c
    // #         d
    // #       e   f    

    a.addDependency(b)
    a.addDependency(c)
    c.addDependency(d)
    d.addDependency(e)
    d.addDependency(f)
  
    let cells = [a, b, c, d, e, f];
    let evalOrder = getEvalOrder(cells);
    // Expect a return value
    expect(evalOrder).toBeDefined();
    // Expect everything to be present
    cells.forEach((cell) => {
        expect(evalOrder).toContain(cell);
    })
    // Expect maintained order.
    // Doesn't care if e is before or after f.
    expect(evalOrder.indexOf(e)).toBeLessThan(evalOrder.indexOf(d));
    expect(evalOrder.indexOf(f)).toBeLessThan(evalOrder.indexOf(d));
    expect(evalOrder.indexOf(d)).toBeLessThan(evalOrder.indexOf(c));
    expect(evalOrder.indexOf(c)).toBeLessThan(evalOrder.indexOf(a));
    expect(evalOrder.indexOf(b)).toBeLessThan(evalOrder.indexOf(a));
    expect(evalOrder.indexOf(a)).toEqual(evalOrder.length - 1); // A should be evaluated last
    
  });

  test('throws an error on cycles', () => {
    let env = new Environment()
    let a = new Cell("A", "number", env);
    let b = new Cell("B", "number", env);
    let c = new Cell("C", "number", env);
    let d = new Cell("D", "number", env);
    let e = new Cell("E", "number", env);
    let f = new Cell("F", "number", env);
    
    // #       a 
    // #    b    c
    // #         d
    // #       e   f
    //             d


    a.addDependency(b)
    a.addDependency(c)
    c.addDependency(d)
    d.addDependency(e)
    d.addDependency(f)
    f.addDependency(d)
  
    let cells: Cell[] = [a, b, c, d, e, f];
    // Expect a return value
    try {
        expect(getEvalOrder(cells)).toThrow()
    } catch(err){
        expect(err.name).toEqual("CellError")
        expect(err).toHaveProperty("cells");
        
        expect(err.cells).toContainEqual(a);
        expect(err.cells).toContainEqual(c);
        expect(err.cells).toContainEqual(d);
        expect(err.cells).toContainEqual(f);
        expect(err.cells.length).toEqual(4);
    }
    

  });