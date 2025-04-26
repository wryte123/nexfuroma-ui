// packages/input/src/index.ts
import Input from './input.vue';
import './input.scss';
import 'virtual:uno.css';

export { Input };
export type InputInstance = InstanceType<typeof Input>;
export * from './props';
