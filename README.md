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
    3. [x] Generalization creation 
    4. [ ] Validated UML (no two attributes with same name, no two classes with same name etc...)
    5. [x] "is identifier" isn't enough, you need to be able to specify an optional id number
    6. [ ] Add support for use-case diagram
    7. [ ] Add support for instances (links and objects), and arrows that connect instances to classes (dashed)
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
    6. [x] Keep history of changes in order to go back and forth (JSON TO STACK)
    7. [x] Remove grid and stuff when exporting JSON (and export just the graph components)
    8. [ ] Add support for exporting only selected items
    9. [ ] Save history to `localStorage`
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
    9. [x] Make `PropertyInspector` resizable (fix: made it float over the paper, and changes size based on content)
    10. [ ] Where possible (all items selected have the same style), show currently selected style 
    11. [x] Possibility to add / select custom colors
    12. [x] Class, also change divider stroke color
    13. [ ] Class, separate color for title and body
    14. [ ] Fix association labels
3. [ ] UX
    1. [x] When creating a class, open the menu of the class 
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
    26. [ ] Add shortcut "+" to add attributes in class!
    27. [ ] focus on newly created attribute when adding an attribute (/ operation)
    28. [ ] move to center of diagram instead of translate 0 0
    29. [ ] highlight currently edited attribute in diagram (maybe one could zoom in the diagram position of the thing)
    30. [ ] when exporting svg, remove the ports!
    31. [ ] please do the png export
4. [ ] BUGS
    1. [x] When resizing graph disappears (fixed: I didn't have to call .render() after setting the new dimensions, it did that autmatically)
    2. [x] Cancel button not working 
    3. [x] Update `localStorage` on deletion of elments too (or debug it at least)
    4. [x] Association label resize width on content change
    5. [x] Fix slow input when editing attributes and operations (i.e. save just after typing, not before)
    6. [x] The smaller the zoom gets, the worse the panning becomes (it's all jittery) 
    7. [x] When moving multiple selected elements, it gets slow



TODO:
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
