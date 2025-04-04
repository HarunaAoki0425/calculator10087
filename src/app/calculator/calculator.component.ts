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
    displayText: string = ''; // 表示用
    lastInputIsOperator: boolean = false; // 直前の入力が演算子かどうか

    // 入力を追加する
    addInput(value: string): void {
        if (this.isOperator(value) && this.lastInputIsOperator) {
            return; // 連続して演算子が入力されるのを防ぐ
        }
        
        this.displayText += value;
        this.lastInputIsOperator = this.isOperator(value);
    }

    // 表示をクリアする
    clearDisplay(): void {
        this.displayText = '';
        this.lastInputIsOperator = false;
    }

    // 計算を実行
    calculateResult(): void {
        try {
            let result = new Function('return ' + this.displayText)();
            if (result > 9999999999) {
                this.displayText = 'Error';
            } else {
                this.displayText = parseFloat(result.toFixed(8)).toString();
            }
        } catch {
            this.displayText = 'Error';
        }
    }
  

    // 直前の入力を削除
    deleteLast(): void {
        this.displayText = this.displayText.slice(0, -1);
        this.lastInputIsOperator = this.isOperator(this.displayText.slice(-1));
    }

    // 演算子かどうかを判定
    private isOperator(value: string): boolean {
        return ['+', '-', '*', '/'].includes(value);
    }
}

