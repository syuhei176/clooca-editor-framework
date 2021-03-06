import {EventEmitter} from 'events'
import SVGUtil from './svg-util'
import Style from './icon.css'


const CursorRange = 6
const CursorOffset = 10

const MODE_NORMAL = 0
const MODE_RUBBERBAND = 1

export class Selector extends EventEmitter {
	constructor() {
		super()
    this.mode = MODE_NORMAL
		this.pos = {
			x : 0,
			y : 0
		};
		this.target = null;
		this.listeners = {
			changed : [],
			removed : []
		};
		const start = () => {

		}
		const end = () => {
			this.emit('change', this.target);
			this.setTarget(this.target);
		}
    const onRubberBundStart = () => {
      console.log("start")
    }
    const onRubberBundEnd = (e) => {
      console.log(e.target)
      const startId = this.target.getId()
      const endId = e.target.dataset.cid
			this.emit('rubberbundend', {
        startId: startId,
        endId: endId,
        event: event
      });
    }


		this.group = SVGUtil.createElement('g', {})
		const baseAttrs = {
	    fill: "#3030ff",
	    stroke: "#fff",
	    strokeWidth: 3,
	    r: CursorRange
		}
		this.cursor = {
			n : SVGUtil.createDraggableElement('circle', Object.assign(baseAttrs, {x:50,y:0}) ),
			s : SVGUtil.createDraggableElement('circle', Object.assign(baseAttrs, {x:50,y:100}) ),
			w : SVGUtil.createDraggableElement('circle', Object.assign(baseAttrs, {x:0,y:50}) ),
			e : SVGUtil.createDraggableElement('circle', Object.assign(baseAttrs, {x:100,y:50}) ),
			nw : SVGUtil.createDraggableElement('circle', Object.assign(baseAttrs, {x:0,y:0}) ),
			ne : SVGUtil.createDraggableElement('circle', Object.assign(baseAttrs, {x:100,y:0}) ),
			sw : SVGUtil.createDraggableElement('circle', Object.assign(baseAttrs, {x:0,y:100}) ),
			se : SVGUtil.createDraggableElement('circle', Object.assign(baseAttrs, {x:100,y:100}) ),
			remove : SVGUtil.createDraggableElement('g', Object.assign(baseAttrs, {x:120,y:50}) ),
			conn : SVGUtil.createDraggableElement('g', Object.assign(baseAttrs, {x:146,y:50}) ),
			edit : SVGUtil.createDraggableElement('g', Object.assign(baseAttrs, {x:172,y:50}) )
		}

    {
      const foreignObject = SVGUtil.createElement('foreignObject', {
        x: 6,
        y: -40,
        width: 20,
        height: 20
      })
      const div = document.createElement('div')
      foreignObject.el.appendChild(div)
      div.classList.add(Style['removeIcon'])
      this.cursor.remove.appendChild(foreignObject)
    }
    {
      const foreignObject = SVGUtil.createElement('foreignObject', {
        x: 32,
        y: -40,
        width: 20,
        height: 20
      })
      const div = document.createElement('div')
      foreignObject.el.appendChild(div)
      div.classList.add(Style['connIcon'])
      this.cursor.conn.appendChild(foreignObject)
    }
    {
      const foreignObject = SVGUtil.createElement('foreignObject', {
        x: 58,
        y: -40,
        width: 20,
        height: 20
      })
      const div = document.createElement('div')
      foreignObject.el.appendChild(div)
      div.classList.add(Style['editIcon'])
      this.cursor.edit.appendChild(foreignObject)
    }
		for(var key in this.cursor) {
			this.group.appendChild(this.cursor[key]);
		}

		this.cursor["n"].drag((dx, dy, x, y, e) => {
			this.target.setPos(this.target_bound.x, this.target_bound.y + dy);
			this.target.setSize(this.target_bound.w, this.target_bound.h - dy);
			this.refresh();
		}, start, end);
		this.cursor["s"].drag((dx, dy, x, y, e) => {
			this.target.setSize(this.target_bound.w, this.target_bound.h + dy);
			this.refresh();
		}, start, end);
		this.cursor["w"].drag((dx, dy, x, y, e) => {
			this.target.setPos(this.target_bound.x + dx, this.target_bound.y);
			this.target.setSize(this.target_bound.w - dx, this.target_bound.h);
			this.refresh();
		}, start, end);
		this.cursor["e"].drag((dx, dy, x, y, e) => {
			this.target.setSize(this.target_bound.w + dx, this.target_bound.h);
			this.refresh();
		}, start, end);
		this.cursor["nw"].drag((dx, dy, x, y, e) => {
			this.target.setPos(this.target_bound.x + dx, this.target_bound.y + dy);
			this.target.setSize(this.target_bound.w - dx, this.target_bound.h - dy);
			this.refresh();
		}, start, end);
		this.cursor["ne"].drag((dx, dy, x, y, e) => {
			this.target.setPos(this.target_bound.x, this.target_bound.y + dy);
			this.target.setSize(this.target_bound.w + dx, this.target_bound.h - dy);
			this.refresh();
		}, start, end);
		this.cursor["sw"].drag((dx, dy, x, y, e) => {
			this.target.setPos(this.target_bound.x + dx, this.target_bound.y);
			this.target.setSize(this.target_bound.w - dx, this.target_bound.h + dy);
			this.refresh();
		}, start, end);
		this.cursor["se"].drag((dx, dy, x, y, e) => {
			this.target.setSize(this.target_bound.w + dx, this.target_bound.h + dy);
			this.refresh();
		}, start, end);
		this.cursor["remove"].click(() => {
			this.onRemove()
			this.clear();
		}, start, end);
		this.cursor["conn"].drag(() => {
			this.onConn()
			this.clear();
		}, onRubberBundStart, onRubberBundEnd);
		this.cursor["edit"].click(() => {
			this.onEdit()
			this.clear();
		}, start, end);

		this.clear();
	}

	clear() {
		//this.target = null;
		this.group.attr({
			visibility : "hidden"
		});
	}

	setTarget(node) {

		this.group.attr({
			visibility : "visible"
		});
		if(this.target) this.target.removeListener("move", this.refresh.bind(this));
		this.target = node;
		this.target_bound = {
			x : this.target.getBound().x,
			y : this.target.getBound().y,
			w : this.target.getBound().w,
			h : this.target.getBound().h
		}
		this.pos.x = node.getX();
		this.pos.y = node.getY();
		this.refresh();
		this.target.on('move', this.refresh.bind(this));

	}

	getEl() {
		return this.group.getEl()
	}

	refresh() {

		if(!this.target) return;
		this.group.transform("translate("+this.target.getBound().x+","+this.target.getBound().y+")");		
		this.cursor.n.attr({
			cx : this.target.getBound().w/2,
			cy : -CursorOffset
		});
		this.cursor.s.attr({
			cx : this.target.getBound().w/2,
			cy : this.target.getBound().h+CursorOffset
		});
		this.cursor.w.attr({
			cx : -CursorOffset,
			cy : this.target.getBound().h/2
		});
		this.cursor.e.attr({
			cx : this.target.getBound().w+CursorOffset,
			cy : this.target.getBound().h/2
		});
		this.cursor.nw.attr({
			cx : -CursorOffset,
			cy : -CursorOffset
		});
		this.cursor.ne.attr({
			cx : this.target.getBound().w+CursorOffset,
			cy : -CursorOffset
		});
		this.cursor.sw.attr({
			cx : -CursorOffset,
			cy : this.target.getBound().h+CursorOffset
		});
		this.cursor.se.attr({
			cx : this.target.getBound().w+CursorOffset,
			cy : this.target.getBound().h+CursorOffset
		});

	}

	onRemove() {
		this.emit('remove', this.target);
    this.target.removeSelf()
	}

  onConn() {
    this.mode = MODE_RUBBERBAND
  }

  onEdit() {
    this.target.edit()
  }

}


export class ConnectionSelector extends EventEmitter {
	constructor() {
		super()
		this.pos = {
			x : 0,
			y : 0
		};
		this.target = null;
		this.listeners = {
			changed : []
		};
		function onstart() {

		}
		const onend = () => {
			this.fireOnChanged(this.target);
			this.setTarget(this.target);
		}

		this.group = SVGUtil.createElement('g', {})
		const baseAttrs = {
	    fill: "#3030ff",
	    stroke: "#fff",
	    strokeWidth: 3
		}
		this.cursor = {
			start : SVGUtil.createDraggableElement('circle', Object.assign(baseAttrs, {x:50,y:0,r:CursorRange}) ),
			end : SVGUtil.createDraggableElement('circle', Object.assign(baseAttrs, {x:50,y:100,r:CursorRange}) ),
			remove : SVGUtil.createDraggableElement('g', Object.assign(baseAttrs, {x:120,y:50}) ),
			edit : SVGUtil.createDraggableElement('g', Object.assign(baseAttrs, {x:172,y:50}) )
		}
    {
      const foreignObject = SVGUtil.createElement('foreignObject', {
        x: 6,
        y: -40,
        width: 20,
        height: 20
      })
      const div = document.createElement('div')
      foreignObject.el.appendChild(div)
      div.classList.add(Style['removeIcon'])
      this.cursor.remove.appendChild(foreignObject)
    }
    {
      const foreignObject = SVGUtil.createElement('foreignObject', {
        x: 58,
        y: -40,
        width: 20,
        height: 20
      })
      const div = document.createElement('div')
      foreignObject.el.appendChild(div)
      div.classList.add(Style['editIcon'])
      this.cursor.edit.appendChild(foreignObject)
    }

		for(var key in this.cursor) {
			this.group.appendChild(this.cursor[key]);
		}

    /*
		this.cursor["start"].drag((dx, dy, x, y, e) => {
			this.target.setStartPos(this.target_start.x + dx, this.target_start.y + dy);
			this.refresh();
		}, onstart, onend);
		this.cursor["end"].drag((dx, dy, x, y, e)  => {
			this.target.setEndPos(this.target_end.x + dx, this.target_end.y + dy);
			this.refresh();
		}, onstart, onend);
    */
		this.cursor["edit"].click(() => {
			this.onEdit()
			this.clear();
		});
		this.clear();		
	}

	getEl() {
		return this.group.getEl()
	}

	clear() {

		this.target = null;
		this.group.attr({
			visibility : "hidden"
		});

	}

  onEdit() {
    this.target.edit()
  }

	setTarget(connection) {
    console.log('setTarget', connection)
		this.group.attr({
			visibility : "visible"
		});
		if(this.target) this.target.removeListener("move");
		this.target = connection;
		this.target_start = {
			x : this.target.getStartPos().x,
			y : this.target.getStartPos().y
		};
		this.target_end = {
			x : this.target.getEndPos().x,
			y : this.target.getEndPos().y
		};
		this.refresh();
		this.target.on('move', function() {
			this.refresh();
		});

	}

	refresh() {

		if(!this.target) return;
    const xx = (this.target.getStartPos().x + this.target.getEndPos().x) / 2
    const yy = (this.target.getStartPos().y + this.target.getEndPos().y) / 2
		this.cursor.remove.transform("translate("+(xx-20)+","+yy+")");
		this.cursor.edit.transform("translate("+(xx-20)+","+yy+")");
    this.cursor.start.attr({
			cx : this.target.getStartPos().x,
			cy : this.target.getStartPos().y
		});
		this.cursor.end.attr({
			cx : this.target.getEndPos().x,
			cy : this.target.getEndPos().y
		});


	}

}


