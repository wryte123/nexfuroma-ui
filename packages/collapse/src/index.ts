import Collapse from './collapse.vue';
import CollapseItem from './collapse-item.vue';
import './collapse.scss';
import 'virtual:uno.css';

export { Collapse, CollapseItem };
export * from './props';
export default {
  Collapse,
  CollapseItem,
};
export type CollapseInstance = InstanceType<typeof Collapse>;
export type CollapseItemInstance = InstanceType<typeof CollapseItem>;
