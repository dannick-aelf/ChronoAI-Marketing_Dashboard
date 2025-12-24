## ADDED Requirements

### Requirement: Modal Backdrop Interaction
Modal backdrop elements SHALL prevent text selection and drag artifacts when users interact with them.

#### Scenario: User clicks and drags on backdrop
- **WHEN** a user clicks and drags on a modal backdrop
- **THEN** no visual artifact or afterimage appears following the cursor
- **AND** the backdrop remains clickable to close the modal

#### Scenario: User clicks backdrop to close
- **WHEN** a user clicks on the modal backdrop
- **THEN** the modal closes as expected
- **AND** no text selection or drag behavior occurs

### Requirement: Modal Backdrop Styling
Modal backdrop elements SHALL use CSS properties to prevent unintended browser behaviors.

#### Scenario: Backdrop prevents selection
- **WHEN** a modal backdrop is rendered
- **THEN** it has `user-select: none` applied
- **AND** it has `draggable={false}` attribute
- **AND** it prevents default drag start behavior
