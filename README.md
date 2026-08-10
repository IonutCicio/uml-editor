# Logic Flows

## Usage

> [!WARNING]
> Read this instructions before using to use it in the best way.


## Contributing

Please use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commits.


### Developing

Once you've installed dependencies with `npm install`, start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

### TODO

(non si possono editare i messaggi dopo 48 ore)

1. [ ] UML
    1. [x] Associations creation
    2. [ ] Association classes 
    3. [ ] Generalization creation 
    4. [ ] Validated UML (no two attributes with same name, no two classes with same name etc...)
        1. [ ] For this, create a bar somewhere with a list of "warnings" and
          errors. This is a global list (or set? for each error one could have
          a key, in order to not have duplicates somehow). This can contain
          both "object-specific warnings" (which are obtained from the graph),
          and global graph warnings (like "no two classes with the same name");
          At this point, maybe, one should be able to se the "object id" on the
          bottom line, or, at least have a visual indication of the problematic
          object (technically not too hard to do! Just get the element from the
          graph).
    5. [x] "is identifier" isn't enough, you need to be able to specify an optional id number
        1. [ ] Now that I think about it! An attribute can have a `list` of identifiers! Not just a "possible identifier"
    6. [ ] Add support for use-case diagram
    7. [ ] Add support for instances (links and objects), and arrows that connect instances to classes (dashed)
    8. [ ] Add support for packages! Allow nesting and stuff, and naming (top
       left bar, min size the length of the text multiple `gridSize` * 2!)
    9. [ ] Add support for "references" (or views?). Like, you can reference a class, and,
       when the original is updated, also the reference view is updated.
        - [ ] Something similar would be super cool for associations too, like
          you could "reference" a portion of a diagram; You  can set the style
          for "references" in the configuration or something. This way all
            references are autmatically similar (unless one sets a specific
            value for the style on some attribute)
    10. [ ] Add shared composition (aggregation and stuff) for design.
3. [ ] Functionality
    1. [x] Import JSON
    2. [x] Export JSON
    3. [x] GitHub action that compiles the website to HTML and publishes it to GitHub Pages
    4. [ ] Offline application (with a ServiceWorker or something, if it's enough to download the html even better)
        - [ ] An option would be to release a zip with the html files, and a python script that serves the files or something
    5. [x] Create a `conf` global object 
        - [x] `fontSize`, `gridSize`,
        - [ ] `fontFamily`, `defaultStyle` etc...
            - [ ] Menu to edit config (settings)
        - [ ] Make it importable, or save it to localStorage (instead of hardcoding it; in case, just put default values)
        - [ ] Maybe make a menu to edit it!
        - [ ] Rename variable to "diagramConfig" (could it be diagram specific? Yeah, it would be better)
    6. [ ] Keep history of changes in order to go back and forth (JSON TO STACK)
    7. [x] Remove grid and stuff when exporting JSON (and export just the graph components)
    8. [ ] Add support for exporting only selected items
    9. [ ] Save history to `localStorage`
        - [ ] Re-evaluate this... already making the history work is too demading! 
        - [ ] Maybe one could have "not save change" by default, unless a
          specific component variable is set to true, like "for this action, do
          save"; nah, it looks like bad design, one should just limit the
          updates in the inspectors to the strictly necessary, and ignore stuff
          like `tempLink` the `selection` window, etc.
    10. [ ] Add "reference lines" or points... when you move an object, you
        should be able to see where it aligns with objects (at least the corners and the middle)
        - [ ] When you create a link, you should be able to see the evenly
          spaced segments of the rectangle (with highlightend points on the
          perimeter)
2. [ ] UI
    1. [x] Snap class dimensions to grid
        - [x] The `width` and `height` are multiples of `conf.gridSize * 2`
        - [x] The `width` is at least the length necessary to show the attributes / operations and at most the `width` choosen by the user (and snapped) 
        - [x] The `width` and `height` are the least length necessary to keep all links on
    2. [x] Icons tooltips
    3. [x] UI for selection 
        - [x] Bring selection rectangle to the foreground 
        - [x] Highlight selected items
    4. [ ] Adjust UI (font sizes of stuff etc...) 
    5. [x] Update paper size when window is resized
    6. [x] Association delete button (or something) when association is selected (and is only one)
    7. [x] Add fixed points to associations (and generalizations)
    8. [ ] Create icon for project, change name to something nicer (rebranding) 
        - [ ] The name part is done; i really like `uml-editor` (as `UML editor`).
    9. [x] Make `PropertyInspector` resizable (fix: made it float over the paper, and changes size based on content)
        - [ ] Now that I think about it, I want only "properties" on the
          property inspector (as in the "definition" of class, or the values of
          the roles in associations); Colors and stuff should be handled by
          selection (like, when you select items, it opens a menu with the
          common style configuration)
    10. [ ] Where possible (all items selected have the same style), show currently selected style 
    11. [x] Possibility to add / select custom colors
    12. [x] Class, also change divider stroke color
    13. [ ] Class, separate color for title and body
    14. [ ] Fix association labels
3. [ ] UX
    1. [x] When creating a class, open the menu of the class (DISCARDED I
       guess? It's way too easy to just double click... opening the menu could
       be breaking the workflow for the user).
    2. [x] Shortcuts lik Ctrl+S to save JSON, and shortcuts for tools 
    3. [x] Better operations and attributes handling (specify name, type, multiplicty, whether it has id or not etc...); the goal is to show different info with different styles (bold for type, italics for {id} etc...)
    4. [ ] If the rectangles of two classes overlap, move them in order to not overlap anymore 
    5. [x] Option to move an attribute from one class to another 
    6. [x] Filter empty attributes 
    7. [x] Ability to change attributes order 
    8. [x] Ability to select multiple objects
        - [x] And change common properties of selected objects
    9. [x] Use `localStorage` in order to remember diagram JSON
    10. [x] Instead of moving when clicking with mouse, start selection (in selection mode)! In selection mode move only when mouse wheel is clicked (this second part is missing)
    11. [ ] Add README description, otherwise people don't know how to use it correclty
    12. [x] Allow copy, paste + delete key (or backspace) shotcut to remove object
        - [x] When pasting, paste on mouse position
    13. [x] When pressing Esc, all stuff closes and deselects
        - [x] For now it deselects
        - [ ] It must close menus too
    14. [ ] Store `zoom` to `localStorage`, load on start
    15. [ ] Always on hints under tool selection on usage (small, gray, with `<code></code>` too for some keys like Ctrl), maybe add possiblity disable hints
        - [ ] Maybe it could be a good idea to have "textual" buttons instead
          of icons. Icons are too hard to differentiate for similar stuff (eg.
          JointJSClass and JointJSObject).
    16. [x] Handle association and generalization moving from one port to another
    17. [x] If a port is connect to an association, there aren't other links to that port; it's either multiple generalizations or one association
    18. [x] Move selected items in tandem
    19. [x] If shift pressed while selecting, select multiple compoments (otherwise deselect only clicked)
    20. [x] Edit class name on double click
    21. [x] Ctrl +, Ctrl - for zoom
    22. [x] Fake class when dragging (not needed anymore, double click to create a class)
    23. [ ] Instructions when opening first time (use `localStorage` to remember to hide), + show help button (show help button could be enough, after github button)
    24. [ ] Fix double click on association (it both creates a vertex and opens the menu; it works well on labels, but not on edge)
    25. [ ] Store paper `translation` to `localStorage`, load on start
    26. [x] Add shortcut "+" to add attributes in class! (NOT NEEDED ANYMORE! We just have text, text, text! It's way easier to work with).
    27. [x] focus on newly created attribute when adding an attribute (/ operation) (NOT NEEDED ANYMORE! We just have text, text, text).
    28. [ ] move to center of diagram instead of translate 0 0 (maybe? Also when reloading the page?)
    29. [ ] highlight currently edited attribute in diagram (maybe one could zoom in the diagram position of the thing)
    30. [x] when exporting svg, remove the ports! (We don't use ports anymore)
    31. [ ] please do the png export
4. [ ] BUGS
    1. [x] When resizing graph disappears (fixed: I didn't have to call .render() after setting the new dimensions, it did that autmatically)
    2. [x] Cancel button not working 
    3. [x] Update `localStorage` on deletion of elments too (or debug it at least)
    4. [x] Association label resize width on content change
    5. [x] Fix slow input when editing attributes and operations (i.e. save just after typing, not before)
    6. [x] The smaller the zoom gets, the worse the panning becomes (it's all jittery) 
    7. [x] When moving multiple selected elements, it gets slow
5. TODO _(so much stuff to do...)_:
    - [x] reduce minimum zoom to 40 (did it to 10!)
    - [ ] dashed line
    - [ ] use-case
    - [ ] actor
    - [ ] object
    - [ ] link
    - [ ] instanceOf
    - [ ] 2 toolbar lines: one for objects-like things, one for link-like things... nah
    - [ ] global "list of warnings" always visible, or at least you can open, with a
    small number of warnings, to show the errors.
        - [ ] this is made because we don't want the editor to fail if there is some
        naive mistake, but we still want to show CLEAR indications of problems, if any (possibly, not directly on the diagram?)
    - [ ] allow having multiple diagrams open! (localStorage by default limits to only one!)
    - [ ] when selected, show the midpoints, the "every 4" points, and the angles (just graphically!)
    - [ ] possibliy alignement lines when two objects are aligned too!
    - [x] the zoom thingies... I can't do it without them, sorry!
    - [ ] make selection the default or something
    - [ ] make selection "all directional"
    - [ ] associations
    - [ ] association classes
    - [ ] Panel with warnings and errors
    - [ ] Generalization
    - [x] Smaller zoom
    - [ ] Diagram title
    - [ ] Re-introduce localStorage saved zoom at some point! (Even though, one would expect to reload to reset the state, so think about it well)
    - [ ] class name background color could be different color of body? 
    - [ ] `autofocus` when inspecting objects (already done for classes)
    - [ ] better association inspection (or different node creation!); doing
    everything with the mouse creates problems (eg. you want to inspect the
    association and you create a node!); maybe the node can be created by
    pressing a key when the mouse is in a certain position?
    - [ ] When opening the association inspector, instead of having
    `sourceMultiplicity` and `targetMultiplicity` take the `id` of the target,
    and obtain the classname of the target; then do something like
    `<SourceClassName> role:` and `<TargetClassName> role:`
    - [ ] For generalizations, have something like a "joint point", like you
      can attach a generalization two one of two things:
        - To a class (directly)
        - To a "joint point" with another generalization (like create from
          point to class, and then join the other classes using a
          generalization line) .
    - [ ] When you first place the link, it is not placed very well, it should
      be immediately straightened somehow...
