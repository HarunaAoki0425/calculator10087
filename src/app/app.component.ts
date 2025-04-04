import { Component } from '@angular/core';
import { CalculatorComponent } from './calculator/calculator.component'; // インポート

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true, // AppComponentをスタンドアロンにする
  imports: [CalculatorComponent], // Standalone Componentのインポート
})
export class AppComponent {
  title = 'calculator-app';
}
