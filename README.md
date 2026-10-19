# CSI3150-Assignment2

4.1:
Starting state: Landing state of the page will show a header and footer with basic
information as expected. A form with a few questions will be visible, along with a section below it
where rows of submitted form entries will be populated.
Action 1: Designated page elements will exist to ask the users questions/tell them what
to submit, allow for data entry via textboxes/dropdown menus, and submit that data using a
button. Some or all of the responses will be marked as required in the code using the “required”
tag.
Action 2: The submit button will take the user’s input and store it (locally or in the site’s
separate database) and append the necessary information in the area below.
Action 3: Below the form is the area designated for displaying data submitted via the
form. It will be organized in a row at the bottom, containing info organized in a consistent way
each time from left-to-right.
Action 4: Users could be allowed to delete individual entries, delete all entries, or maybe
even modify existing entries to update them with more accurate information if necessary.
Terminal State: The completed state would have as many entries listed in the bottom
section as possible, and everything else about the page (header, footer, and form) would remain
unchanged and just as clearly displayed to the user should they want to add any more entries to
the form later.
4.2:
Norman Principle / Concept System Context Questions to Answer Using
Concrete Implementation
Mechanism (DOM / HTML /
JS)
Gulf of Execution Typing numeric sensor
metrics (pH,
ElecticalConductivity[EC],
Temp, Humidity)
How do field labels, units of
measure, and placeholder
attributes clarify expected
formats to the user? Field
labels simply ask a question
or tell a statement to the user
to input something specific.
Units of measure help to
encourage and ensure
consistency between all
numerical values input.
Placeholder attributes give an
example of what would be a
valid response to the
above-listed field label so the
user is less likely to respond
with something meaningless
to what is actually being
asked.
Gulf of Evaluation Ingesting sensor values after How does the system
clicking “Record Reading” immediately communicate
whether the input given is in a
normal, warning, or hazard
state? As listed above,
ranges are given above for
the pH, Temp, EC, and RH,
and based on where values
fall the classification will be
checked if it is Critical, if not
then checked for if it is
Optimal, and if not then it is
deemed as a warning.
System Constraint E.g. Water pH Boundaries
(0.0 <= pH <= 14.0)
What attributes and validation
conditions prevent impossible
scientific values from entering
state?* See hint after this
table These are established
numerical ranges
implemented in the coding for
the form so that values not
within the range are rejected
because they are unrealistic
Visual Feedback State Real-Time Input Error /
Out-of-Bounds
What visual property or class
change alerts the user that a
typed number is
dangerous/wrong before
submission? Red text will
display explaining how the
input is invalid, the border of
the textbox will become red,
and form will fail to submit.
Could also play an error
sound effect for fun.
Error Recovery Accidental or test data
submissions
What affordance exists to
clear bad records or
accidental inputs from the
active queue? Users can
manually remove any
submissions later on via a
clearly marked delete button.
4.3:
● <header class=”portal-header”>
○ <div class=”header-content>
■ <div class=”brand”>
● <span class=”brand-icon”>
● <h1>Greenhouse <span class=”brand-sub”>Sensor Loggers
● <main class=”portal-container”>
○ <aside class=”panel form-panel”
■ <h2>Fill out the form
■ <div id=”form-error-banner”>
■ form id="vitals-form"
● div class=form-group
○ label for=”pH Input”
○ input: number, min=0, max=14
● div class=form-group
○ label for=”Electrical Conductivity (EC)” >Unit: mS/cm<>
○ input: number
● div class=form-group
○ label for=”Air Temperature (Temp)” >Unit: degree
Fahrenheit<>
○ input: number
● div class=form-group
○ label for=”Relative Humidity (RH)” >Unit: percentage<>
○ input: number
● button type="submit" id="btn-submit" class="btn btn-primary
btn-block"
■ section class=panel records-panel
● div class=records-header
○ h2 class=panel-title
○ button id=btn-clear-all class=btn btn-outline-danger btn-sm
● div id=empty-state class=empty-state
○ span class=empty-icon
○ p >no entries<>
● ul id=records-list class=records-grid aria-live="polite"
■ footer class=portal-footer
● p >&copy; 2026 CSI3150 Assignment 2 F2026<>
4.4:
const greenhouseSensorSchema = {
id: “String”, //formatted unique numeric identifier
email: “String”, //personal email address
pH: “String”, //formatted pH value
EC: “String”, //formatted Electrical Conductivity value
Temp: “String”, //formatted Air Temperature value
RH: “String” //formatted Relative Humidity value
}
