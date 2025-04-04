import { bootstrapApplication } from '@angular/platform-browser';
import { CalculatorComponent } from './app/calculator/calculator.component';

bootstrapApplication(CalculatorComponent)
    .catch(err => console.error(err));
