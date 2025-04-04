import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
    selector: 'app-calculator',
    standalone: true,
    templateUrl: './calculator.component.html',
    styleUrls: ['./calculator.component.css'],
    imports: [CommonModule, FormsModule] 
})
export class CalculatorComponent {
    display: string = '';
    operatorSet: boolean = false;

    appendToDisplay(value: string): void {
        if (this.isOperator(value) && this.operatorSet) {
            return; // 連続した演算子の入力を防ぐ
        }
        this.display += value;
        this.operatorSet = this.isOperator(value);
    }

    clearDisplay(): void {
        this.display = '';
        this.operatorSet = false;
    }

    calculateResult(): void {
        try {
            let result = new Function('return ' + this.display)();
            if (result > 9999999999) {
                this.display = 'Error';
            } else {
                this.display = parseFloat(result.toFixed(8)).toString();
            }
        } catch {
            this.display = 'Error';
        }
    }

    deleteLast(): void {
        this.display = this.display.slice(0, -1);
        this.operatorSet = this.isOperator(this.display.slice(-1));
    }

    private isOperator(value: string): boolean {
        return ['+', '-', '*', '/'].includes(value);
    }
}
