// Editor.js
const { computed, onMounted ,defineModel,inject,watch,onUpdated} = Vue;

export default {
    template: `
        <div class="modal fade" data-bs-backdrop="static" data-bs-focus="false" id="modal-editor" >
            <div class="modal-dialog modal-lg modal-bac">
                <div class="modal-content">
                    <div class="modal-head">
                        <button class="btn-close d-block ms-auto fs-2 me-2 mt-2" @click="closeEditor" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="form-group mb-4">
                            <label for="title" class="h4">Title</label>
                            <input type="text" name="title" id="title" class="form-control" v-model="element.title">
                        </div>
                        <div class="form-group mb-2">
                            <label for="ckeditor" class="h4">Content</label>
                            <textarea id="ckeditor" cols="30" rows="10"></textarea>
                        
                        </div>
                        
                        <div class="d-flex  mb-2" v-for="node in element.nodes" :key="node.id">
                            <template v-if="node.linkId">
                                <label :for="'caption-'+ node.id" class="col-3 form-label h4">Caption {{node.id}}</label>
                                <input type="text" :name="'caption-'+ node.id" :id="'caption-'+ node.id" class="form-control col-9 flex-shrink-1" v-model="node.caption">
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  `,
    props: ['element'],
    setup(props, { emit }) {
        let modal;
        const element = props.element;
        // hooks
        onUpdated(()=>{
            CKEDITOR.instances.ckeditor.setData(props.element.content);
        })
        // Initialize modal when component is mounted
        onMounted(() => {
            modal = new bootstrap.Modal(document.getElementById('modal-editor'));
            modal.show();
        //     load ckeditor
            CKEDITOR.replace('ckeditor', {
                removePlugins: ['cloudservices', 'easyimage']
            });
            CKEDITOR.instances.ckeditor.setData(props.element.content);
            CKEDITOR.instances.ckeditor.on('change', () =>{
                props.element.content = CKEDITOR.instances.ckeditor.getData();
            });

        });

        // Close the editor modal and emit update event
        const deselect = inject('deselect');
        function closeEditor() {
            modal.hide();
            deselect();
        }
        return {
            closeEditor,
            element,
        };
    },
};
