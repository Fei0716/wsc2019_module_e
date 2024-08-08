const template = `
        <img src="./src/assets/knowledge_explorer.png" alt="Knowledge Explorer's Logo" id="img-logo" class="m-5 top-0 left-0">

        <ElementItem v-for="element in elements" :key="element.id" :element="element" @showEditor="displayModal(element)" @linkingStart="(node,element,event)=>linkingStart(node,element,event)" @linkingEnd="(node,element)=>linkingDone(node,element,event)"/>
        
         <svg class="links" role="img" aria-label="Line that link between two elements">
            <Link v-for="link in links" :key="link.id" :link="link" />
        </svg>
           <h1>{{elementForEdit}}</h1>
        <Editor v-if="selectedElement" :element="selectedElement"  />
        
        <div class="position-absolute top-0 end-0 d-flex gap-2 m-5">
            <button class="btn btn-primary" @click="switchMode">View Mode</button>
            <button class="btn btn-warning" @click="clear">Clear</button>
        </div>
        
        <div v-if="isLinking" class="linkingNode" :style="style">{{linking.node.id}}</div>
`;
import ElementItem from '../components/ElementItem.js';
import Editor from '../components/Editor.js';
import Link from '../components/Link.js';

const {computed,ref,reactive, watchEffect,provide,onMounted,inject,onUnmounted} = Vue;

export default{
    template,
    components:{
        ElementItem,
        Editor,
        Link,
    },
    props: ['elements','links'],
    setup(props){
        // state
        const linking = reactive({});
        const isLinking = ref(false);
        let tempX = 0;
        let tempY = 0;

        // computed properties
        const selectedElement  = computed(()=>{
            return props.elements.find(e => e.selected);
        });
        const style= computed(()=>{
            return {
                top: `${linking.y}px`,
                left: `${linking.x}px`,
            };
        });
        const clear = inject('clear');
        // functions
        const removeRelation = inject('removeRelation');

        function deleteLink(){
            const link = props.links.find(l => l.selected);
            removeRelation(link.id);
        }
        function keydownHandler(e){
            switch(e.key){
                case 'Delete':
                case 'Backspace':
                    // delete the link
                    deleteLink();
                    break;
                default:break;
            }
        }
        function linkingStart(node,element,event){
            tempX = event.pageX;
            tempY = event.pageY;
            linking.element = element;
            linking.node = node;
            linking.x  = event.pageX;
            linking.y  = event.pageY;
            isLinking.value = true;
            window.addEventListener('mousemove',linkingMove);
            window.addEventListener('mouseup',linkingEnd);

        }
        function linkingMove(e){
            if(!isLinking.value)return;
            linking.x += e.pageX - tempX;
            linking.y += e.pageY - tempY;

            tempX = e.pageX;
            tempY = e.pageY;

        }
        function linkingEnd(node,element,event){
            if(!isLinking.value)return;
            isLinking.value= false;
            window.removeEventListener('mousemove',linkingMove)
            window.removeEventListener('mouseup',linkingEnd);
        }
        const createLinkRelation = inject('createLinkRelation');
        function linkingDone(node,element){
            if(!isLinking.value||linking.element.id == element.id || node.linkId)return;
            tempX = 0;
            tempY = 0;
            createLinkRelation(element,node,linking.element,linking.node);
        }
        const mode = inject('mode');
        function switchMode(){
            mode.value = 'view';
        }
        // hooks
        onMounted(()=>{
            window.addEventListener('keydown',keydownHandler);


        });
        onUnmounted(()=>{
            window.removeEventListener('keydown',keydownHandler);
        });
        return{
            selectedElement,
            clear,
            linkingStart,
            linkingDone,
            style,
            isLinking,
            linking,
            switchMode,
        }
    }
}