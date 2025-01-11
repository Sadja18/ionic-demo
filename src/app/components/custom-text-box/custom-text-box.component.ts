import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-custom-text-box',
  templateUrl: './custom-text-box.component.html',
  styleUrls: ['./custom-text-box.component.scss'],
  imports: [
    CommonModule,
    IonicModule
  ],
})
export class CustomTextBoxComponent  implements OnInit {
  // Incoming data for the input field
  @Input() value: string = '';

  // Input properties to customize the component
  @Input() type: 'text area' | 'single line' | 'number' = 'single line'; // Default type is single line
  @Input() label: string = ''; // Label for the input field
  @Input() labelPlacement: 'stacked' | 'floating' = 'floating'; // Default label placement
  @Input() placeholder: string = 'Enter text'; // Placeholder text
  @Input() clearInput: boolean = true; // Clear input option
  @Input() fill: 'solid' | 'outline' = 'solid'; // Fill type for the input
  @Input() inputCounter: number = 20; // Maximum character limit for the input
  @Input() lineLimit: number = 10; // Maximum lines for the text area
  @Input() roundedEdges: boolean = true; // Rounded edges for input field
  
  // Output event to send the entered value to parent
  @Output() valueChange = new EventEmitter<string>();

  // Event handler for input change
  onInputChange(event: any): void {
    this.valueChange.emit(event.target.value);
  }

  constructor() { }

  ngOnInit() {}

}
