import { ModuleWithProviders, NgModule } from '@angular/core';
import { MapToIterable } from './map-to-iterable';
import { OrderBy } from './order-by';

export { MapToIterable } from './map-to-iterable';
export { OrderBy } from './order-by';

@NgModule({
	exports: [MapToIterable, OrderBy],
	declarations: [MapToIterable, OrderBy],
	providers: [OrderBy]
})
export class PipesModule {}
