import { Field, SmartContract, state, State, method } from 'o1js';

export class Square extends SmartContract {
  @state(Field) num = State<Field>();

  init() {
    super.init();
    this.num.set(Field(2));
  }

  @method update(square: Field) {
    const currentState = this.num.get();
    this.num.requireEquals(currentState);
    // const currentState = this.num.getAndRequireEquals();
    square.assertEquals(currentState);
    this.num.set(currentState.mul(currentState));
  }
}
