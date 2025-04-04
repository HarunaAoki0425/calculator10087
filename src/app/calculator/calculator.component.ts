import { Component } from '@angular/core';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css'],
  standalone: true, // Standalone Component にする
})
export class CalculatorComponent {
  // コンポーネントのロジックはそのまま
  displayValue: string = '';
  currentValue: string = '';
  previousValue: string = '';
  operator: string = '';
  buttons: string[] = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+', 'C'
  ];

  onButtonClick(button: string) {
    if (button === '=') {
      this.calculate();
    } else if (button === 'C') {
      this.clear();
    } else if (button === '.' && !this.currentValue.includes('.')) {
      this.currentValue += button;
    } else if ('0123456789'.includes(button)) {
      this.currentValue += button;
    } else {
      this.applyOperator(button);
    }
    this.displayValue = this.currentValue;
  }

  calculate() {
    try {
      const result = eval(`${this.previousValue}${this.operator}${this.currentValue}`);
      if (result >= 10000000000) {
        this.displayValue = 'Error: Value exceeds 10 Billion';
        return;
      }
      this.displayValue = this.formatNumber(result);
      this.previousValue = this.displayValue;
      this.currentValue = '';
      this.operator = '';
    } catch (e) {
      this.displayValue = 'Error';
    }
  }

  applyOperator(operator: string) {
    if (this.currentValue === '') return;
    if (this.previousValue === '') {
      this.previousValue = this.currentValue;
    } else if (this.operator !== '') {
      this.calculate();
    }
    this.operator = operator;
    this.currentValue = '';
  }

  clear() {
    this.previousValue = '';
    this.currentValue = '';
    this.operator = '';
    this.displayValue = '';
  }

  formatNumber(value: any): string {
    if (!value.toString().includes('.')) {
      return value.toString();
    }
    let result = value.toFixed(8);
    if (value >= 10000000000) {
      return 'Error: Value exceeds 10 Billion';
    }
    return result;
  }
}
