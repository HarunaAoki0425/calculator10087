import { Component } from '@angular/core';
import { CalculatorComponent } from './calculator/calculator.component'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true, 
  imports: [CalculatorComponent],
})
export class AppComponent {
  title = 'calculator-app';
}
