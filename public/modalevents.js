$('#taskedit-modal').on('show.bs.modal', function (event) {
    var trigger = $(event.relatedTarget)
    var taskname = trigger.find('#taskname').text()
    var modal = $(this)
    modal.find('#title').text('Edit ' + taskname)
    modal.find('#task-name').val(taskname)
    modal.find('#task-id').val(trigger.parent().attr('id'))
})

$('#boardedit-modal').on('show.bs.modal', function (event) {

})