import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-custom-drop-down',
  templateUrl: './custom-drop-down.component.html',
  styleUrls: ['./custom-drop-down.component.scss'],
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class CustomDropDownComponent  implements OnInit {

  // Input properties 
  @Input() selectedValue : string = '';

  @Input() selectOptions: { label: string; value: string }[] = []; // Dropdown options
  @Input() interface: 'alert' | 'popover' | 'action-sheet' = 'alert'; // Default interface
  @Input() fill: 'solid' | 'outline' = 'solid'; // Fill style
  @Input() icon: string | undefined; // Custom icon for dropdown arrow
  @Input() label: string = ''; // Label for the dropdown
  @Input() labelPlacement: 'floating' | 'stacked' | 'fixed' = 'floating'; // Label placement
  @Input() placeholder: string = 'Select an option'; // Placeholder text

  // Output event to emit the selected value
  @Output() valueChange = new EventEmitter<string>();

  // Event handler for selection change
  onSelectionChange(event: any): void {
    this.valueChange.emit(event.detail.value);
  }
  
  constructor() { }

  ngOnInit() {}

}
