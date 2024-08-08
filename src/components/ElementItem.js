const template = `
       <div class="element" :class="cl" :style="style" @mousedown="dragStart" aria-label="An element representing a route" tabindex="0">
            <div class="nodes">
                <div class="node" v-for="node in element.nodes" :key="node.id" @click="createRelationship(element,node)" @mousedown.shift.stop="(e) => linkingStart(node,element,e)" @mouseup="(e)=>linkingEnd(node,element,e)" tabindex="0">
                    <span>{{node.id}}</span>
                </div>
            </div>
            <div class="tools">
                <button class="btn btn-primary" @click="editElement" >Edit</button>
                <button class="btn btn-danger" @click="deleteElement" v-if="element.id != 'root'">Delete</button>
             </div>
       </div>
`;
const {ref,reactive,computed,inject} = Vue;
export default{
    template,
    props:['element'],
    emits:['linkingStart','linkingEnd'],
    setup(props,{emit}){
        // states
        const element = props.element;
        const isDragging = ref(false);
        const lastX = ref(0);
        const lastY = ref(0);
        const move = ref(0);
        //     computed properties
        const style = computed(()=>{
            return{
                left: `${props.element.x}px`,
                top: `${props.element.y}px`,
            }
        })
        const elementFromViewMode = inject('element');
        const mode = inject('mode');
        const cl = computed(()=>{
            const classes = [];
            if(mode.value == 'view'){
                console.log(elementFromViewMode.value.id);
                if(element.id ==elementFromViewMode.value.id){
                    classes.push('viewed');
                }
            }
            return classes;
        });
        // functions
        function dragStart({pageX, pageY}){
            isDragging.value = true;
            lastX.value = pageX;
            lastY.value = pageY;
            move.value = 0;

            window.addEventListener('mousemove', dragMove);
            window.addEventListener('mouseup', dragEnd);
        }
        function dragMove({pageX, pageY}){
            if(!isDragging.value){
                return;
            }
            // distance move
            element.x += pageX - lastX.value;
            element.y += pageY - lastY.value;
            move.value++;
            lastX.value = pageX;
            lastY.value = pageY;
        }
        function dragEnd(){
            lastX.value = 0;
            lastY.value = 0;
            isDragging.value = false;
            window.removeEventListener('mousemove', dragMove);
            window.removeEventListener('mouseup', dragEnd);
        }
        const createRelation = inject('createRelation');
        function createRelationship(e,n){
            //if is moving mouse then cancel relation creation
            if(move.value > 3) return;
            //call function in main.js
            createRelation(e,n);
        }
        const removeElement = inject('removeElement');
        function deleteElement(){
            // only continue executing the function when it's one single click
            if(move.value > 3) return;
            removeElement(element);
        }
        const select = inject('select');

        function editElement(){
            if(move.value > 3) return;
            select(element);
        }

        function linkingStart(node,element,e){
            emit('linkingStart',node ,element,e);
        }
        function linkingEnd(node,element,e){
            emit('linkingEnd',node ,element,e);
        }
        return{
            style,
            dragStart,
            createRelationship,
            deleteElement,
            editElement,
            linkingStart,
            linkingEnd,
            cl,
        }
    }
}