import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {
  display: string = ''; 
  prevIsOperator: boolean = false; 
  resultDisplayed: boolean = false; 

  press(value: string): void {
    if (this.resultDisplayed) {
      if (this.isOperator(value)) {
        this.display = this.display + value;
        this.resultDisplayed = false;
      } else {
        this.display = value;
        this.resultDisplayed = false;
      }
    } else {
      if (this.isOperator(value)) {
        if (this.prevIsOperator || this.display === '') {
          return;
        }
        this.prevIsOperator = true;
      } else {
        this.prevIsOperator = false;
        if (!this.canAddValue(value)) {
          return;
        }
      }
      this.display += value;
    }
  
    this.scrollToEnd();  // 文字が追加された後、スクロール位置を調整
  }  

  private canAddValue(value: string): boolean {
    const next = this.display + value;
    const lastNumberMatch = next.match(/(\d+(\.\d*)?)$/);
    if (!lastNumberMatch) return true;

    const [integerPart, decimalPart] = lastNumberMatch[0].split('.');
    if (integerPart.length > 10 || (decimalPart && decimalPart.length > 8)) {
      return false;
    }

    return !isNaN(parseFloat(next)) && parseFloat(next) <= 9999999999.99999999;
  }

  private scrollToEnd(): void {
    const displayElement = document.getElementById('display');
    if (displayElement) {
      displayElement.scrollLeft = displayElement.scrollWidth;
    }
  }

  evaluate(): void {
    try {
      const result = this.calculate(this.display);

      if (result >= 10000000000) {
        this.display = 'Error';
      } else {
        this.display = this.formatResult(result);
      }
    } catch {
      this.display = 'Error';
    }
    this.resultDisplayed = true;
  }

  private calculate(expression: string): number {
    const tokens = this.tokenize(expression);
    const values: number[] = [];
    const operators: string[] = [];

    let i = 0;

    while (i < tokens.length) {
      const token = tokens[i];

      if (this.isNumber(token)) {
        values.push(parseFloat(token));
      } else if (this.isOperator(token)) {
        while (
          operators.length &&
          this.hasPrecedence(token, operators[operators.length - 1])
        ) {
          const b = values.pop()!;
          const a = values.pop()!;
          const op = operators.pop()!;
          values.push(this.applyOperator(a, b, op));
        }
        operators.push(token);
      }
      i++;
    }

    while (operators.length) {
      const b = values.pop()!;
      const a = values.pop()!;
      const op = operators.pop()!;
      values.push(this.applyOperator(a, b, op));
    }

    return values.pop()!;
  }

  private tokenize(expression: string): string[] {
    const regex = /\d+(\.\d*)?|\+|\-|\*|\//g;
    return expression.match(regex) || [];
  }

  private isNumber(value: string): boolean {
    return !isNaN(parseFloat(value));
  }

  private isOperator(value: string): boolean {
    return ['+', '-', '*', '/'].includes(value);
  }

  private hasPrecedence(op1: string, op2: string): boolean {
    if ((op1 === '*' || op1 === '/') && (op2 === '+' || op2 === '-')) {
      return false;
    }
    return true;
  }

  private applyOperator(a: number, b: number, op: string): number {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        if (b === 0) throw new Error("Cannot divide by zero");
        return a / b;
      default:
        throw new Error("Unknown operator");
    }
  }

  private formatResult(value: number): string {
    let resultStr = value.toFixed(8);
    return resultStr.replace(/\.?0+$/, '');
  }

  deleteLast(): void {
    this.display = this.display.slice(0, -1);
    this.prevIsOperator = this.isOperator(this.display.slice(-1));
  }

  clear(): void {
    this.display = '';
    this.prevIsOperator = false;
    this.resultDisplayed = false;
  }
}
