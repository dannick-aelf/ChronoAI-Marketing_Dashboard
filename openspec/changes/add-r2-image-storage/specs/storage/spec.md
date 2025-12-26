## ADDED Requirements

### Requirement: R2 Image Storage
The system SHALL store uploaded images in Cloudflare R2 object storage instead of base64-encoded data URLs.

#### Scenario: Image upload to R2
- **WHEN** a user uploads an image file
- **THEN** the image SHALL be uploaded to R2 bucket
- **AND** the system SHALL return an R2 URL for the uploaded image
- **AND** the R2 URL SHALL be stored in the canvas object `content` field

#### Scenario: Image retrieval from R2
- **WHEN** a canvas object contains an R2 URL in the `content` field
- **THEN** the system SHALL fetch the image from R2
- **AND** the image SHALL be displayed in the canvas

#### Scenario: Image deletion from R2
- **WHEN** a canvas object with an R2 image is deleted
- **THEN** the system SHALL delete the image from R2 bucket
- **AND** the R2 object SHALL be removed

#### Scenario: R2 upload error handling
- **WHEN** an image upload to R2 fails
- **THEN** the system SHALL display an error message to the user
- **AND** the canvas object SHALL NOT be created
- **AND** the user SHALL be able to retry the upload

#### Scenario: R2 image access error handling
- **WHEN** an R2 image URL fails to load
- **THEN** the system SHALL display a placeholder or error indicator
- **AND** the canvas SHALL remain functional for other objects

## MODIFIED Requirements

### Requirement: Image Storage Format
Canvas objects SHALL store image references as R2 URLs instead of base64 data URLs.

**Previous Behavior**: Images were stored as base64-encoded data URLs in the `content` field.

**New Behavior**: Images SHALL be stored as R2 object URLs in the `content` field.

**Migration**: Existing base64 images MAY be migrated to R2 incrementally. The system SHALL support both formats during migration period.

#### Scenario: Canvas object with R2 URL
- **WHEN** a canvas object has `content` field containing an R2 URL (format: `https://pub-*.r2.dev/images/*`)
- **THEN** the system SHALL fetch and display the image from R2
- **AND** the image SHALL render correctly in the canvas

#### Scenario: Canvas object with base64 URL (backward compatibility)
- **WHEN** a canvas object has `content` field containing a base64 data URL (format: `data:image/*;base64,*`)
- **THEN** the system SHALL display the image from the data URL
- **AND** the system MAY migrate the image to R2 in the background

## ADDED Requirements

### Requirement: R2 Storage Service API
The system SHALL provide a Pages Function API endpoint `/api/r2` for R2 operations.

#### Scenario: Upload image via API
- **WHEN** a POST request is made to `/api/r2` with image data
- **THEN** the system SHALL upload the image to R2 bucket
- **AND** the system SHALL generate a unique object key
- **AND** the system SHALL return the R2 URL in the response
- **AND** the response SHALL include CORS headers

#### Scenario: Retrieve image via API
- **WHEN** a GET request is made to `/api/r2/:key`
- **THEN** the system SHALL fetch the image from R2
- **AND** the system SHALL return the image with appropriate Content-Type header
- **AND** the response SHALL include CORS headers

#### Scenario: Delete image via API
- **WHEN** a DELETE request is made to `/api/r2/:key`
- **THEN** the system SHALL delete the image from R2 bucket
- **AND** the system SHALL return success response
- **AND** the response SHALL include CORS headers

### Requirement: R2 Object Key Format
R2 object keys SHALL follow the format: `images/{uuid}.{extension}`

#### Scenario: Generate unique object key
- **WHEN** an image is uploaded
- **THEN** the system SHALL generate a UUID for the object key
- **AND** the object key SHALL include the file extension
- **AND** the object key SHALL be prefixed with `images/`
- **AND** the object key SHALL be unique

### Requirement: R2 Bucket Configuration
The system SHALL be configured with an R2 bucket binding in Cloudflare Pages Functions.

#### Scenario: R2 bucket binding
- **WHEN** the Pages Function accesses R2 storage
- **THEN** the R2 bucket SHALL be accessible via environment binding
- **AND** the binding name SHALL be `STORAGE_R2`
- **AND** the bucket SHALL be configured in Pages Functions settings
