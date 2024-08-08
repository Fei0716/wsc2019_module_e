const template = `
    <section class="row mh-100" id="view-section">
            <!--navigation area-->
           <div class="col-md-4 col-12 bg-white h-100" id="side-nav-container">
                <img src="./src/assets/knowledge_explorer.png" alt="Knowledge Explorer's Logo" id="img-logo" >
           
                <button class="btn btn-primary  d-block mx-auto" @click="switchMode">Edit Mode</button>
                
                <!--controls-->
                <div id="controls" class="d-flex flex-column gap-3">
                    <div v-for="node in element.nodes" :class="{disabled:!!!node.linkId}" :key="node.id" class="bg-dark" @keydown.enter="navigate(node.id)" @click="navigate(node.id)" tabindex="0" role="button" aria-label="'Button to Navigate to the '+ direction(node.id)">
                        <div>{{direction(node.id)}}</div>
                        <div>{{node.caption}}</div>
                    </div>
                </div>
<!--                map for navigation-->
                <div class="map">
                    <div class="map-layout">
                        <EditMode :elements="elements":links="links"></EditMode>
                    </div>
                </div>
            </div>
            <!--slide area-->
            <div class="col-md-8 col-12 bg-dark d-flex align-items-center justify-content-center " id="slide-container">
            <div class="wrapper">
                            <transition :name="transitionName" enter-active-class="slide-active" leave-active-class="slide-active" mode="out-in" appear>
<!--                remember to specify the key-->
                   <div class="card text-justify p-5" :key="element.id">
                            <div id="slide" class="card-    body">
                                   <h2 class="text-center mb-5">{{element.title}}</h2>
                                   <div v-html="element.content"></div>
                            </div>
                        
                    </div>
                </transition>
            </div>

            </div>
    </section>
`;
import EditMode from './EditMode.js';
const {computed,ref,reactive, watchEffect,provide,onMounted,inject,onUnmounted} = Vue;
export default{
    template,
    components:{
        EditMode,
    },
    props: ['elements','links'],
    setup(props){
        // state
        const elements = props.elements;
        const links = props.links;
        const currentId = ref('root');
        const to = ref(0);
        // computed prop
        const element = computed(()=>{
            return elements.find(e => e.id == currentId.value);
        })

        provide('element' ,element);
        // computed prop
        const transitionName = computed(()=>{
            switch(to.value){
                case 0: return 'slide-center';
                case 1: return 'slide-up';
                case 2: return 'slide-right';
                case 3: return 'slide-down';
                case 4: return 'slide-left';
            }
        })
        // enter fullscreen
        onMounted(()=>{
            document.documentElement.requestFullscreen();
            window.addEventListener('keydown' , handlerKeydown);
        //     make all elements of map not tabbable
            const map = document.querySelector('.map');
            const mapAncestors = map.querySelectorAll('*');
            mapAncestors.forEach(e=> e.tabIndex = -1);
        });
        onUnmounted(()=>{
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            window.removeEventListener('keydown' , handlerKeydown);
        });
        function handlerKeydown(e){
            switch(e.key){
                case '1' : case '2': case '3': case '4':
                    navigate(e.key);
                    break;
                default: break;
            }
        }
        const mode = inject('mode');
        function switchMode(){
            mode.value = 'edit';
        }
        function direction(nodeId){
            switch(nodeId){
                case 1: return 'Up'
                case 2: return 'Right';
                case 3: return 'Down';
                case 4: return 'Left';
            }
        }
        function navigate(nodeId){
            const node = element._value.nodes.find(n => n.id == parseInt(nodeId));
            if(node.linkId == null)return;
            const link = props.links.find(l => l.id == node.linkId);
            currentId.value = link.to.node.id != node.id ? link.to.element.id : link.from.element.id;
            to.value = node.id;
        }
        return{
            switchMode,
            elements,
            links,
            element,
            direction,
            navigate,
            transitionName,
        }

    }
}